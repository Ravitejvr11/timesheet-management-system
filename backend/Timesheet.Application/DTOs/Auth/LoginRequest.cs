namespace Timesheet.Application.DTOs.Auth;

public sealed record LoginRequest(
    string UserName,
    string Password
);
