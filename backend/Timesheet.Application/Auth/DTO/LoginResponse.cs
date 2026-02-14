namespace Timesheet.Application.Auth.DTO;

public sealed record LoginResponse(
    string Token,
    DateTime Expiration
);
