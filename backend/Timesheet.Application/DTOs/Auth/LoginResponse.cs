namespace Timesheet.Application.DTOs.Auth;

public sealed record LoginResponse(
    string Token,
    DateTime Expiration
);
