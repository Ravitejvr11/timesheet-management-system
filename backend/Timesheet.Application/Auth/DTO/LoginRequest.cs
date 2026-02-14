namespace Timesheet.Application.Auth.DTO;

public sealed record LoginRequest(
    string UserName,
    string Password
);
