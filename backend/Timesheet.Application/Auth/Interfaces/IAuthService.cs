using Timesheet.Application.Auth.DTO;

namespace Timesheet.Application.Auth.Interfaces;

public interface IAuthService
{
    Task<LoginResponse?> LoginAsync(LoginRequest request);
}
