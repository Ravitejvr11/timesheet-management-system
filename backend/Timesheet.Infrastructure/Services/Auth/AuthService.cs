using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BCrypt.Net;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Timesheet.Application.Auth.Interfaces;
using Timesheet.Application.Auth.DTO;
using Timesheet.Domain.Entities;
using Timesheet.Infrastructure.Persistence;

namespace Timesheet.Infrastructure.Services.Auth;

public sealed class AuthService(
    AppDbContext context,
    IConfiguration configuration
) : IAuthService
{
    private readonly AppDbContext _context = context;
    private readonly IConfiguration _configuration = configuration;

    public async Task<LoginResponse?> LoginAsync(LoginRequest request)
    {
        var user = await _context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.UserName == request.UserName && u.IsActive);

        if (user is null)
            return null;

        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return null;

        return GenerateJwtToken(user);
    }

    private LoginResponse GenerateJwtToken(User user)
    {
        var jwtSettings = _configuration.GetSection("JwtSettings");

        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(jwtSettings["Secret"]!)
        );

        var credentials = new SigningCredentials(
            key,
            SecurityAlgorithms.HmacSha256
        );

        var claims = new[]
        {
            new Claim("userId", user.Id.ToString()),
            new Claim("userName", user.UserName),
            new Claim("role", user.Role.ToString())
        };

        var expires = DateTime.UtcNow.AddMinutes(
            int.Parse(jwtSettings["ExpiryMinutes"]!)
        );

        var token = new JwtSecurityToken(
            issuer: jwtSettings["Issuer"],
            audience: jwtSettings["Audience"],
            claims: claims,
            expires: expires,
            signingCredentials: credentials
        );

        return new LoginResponse(
            new JwtSecurityTokenHandler().WriteToken(token),
            expires
        );
    }
}
