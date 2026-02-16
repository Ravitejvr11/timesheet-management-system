using Microsoft.AspNetCore.Mvc;
using Timesheet.Application.Auth.DTO;
using Timesheet.Application.Auth.Interfaces;

namespace Timesheet.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(IAuthService authService) : BaseController
{
    [HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> Login(LoginRequest request)
    {
        var result = await authService.LoginAsync(request);

        return result is null
            ? Unauthorized("Invalid username or password.")
            : Ok(result);
    }
}
