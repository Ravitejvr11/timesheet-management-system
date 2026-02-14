using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Timesheet.Application.Projects.Interfaces;

namespace Timesheet.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProjectsController(IProjectService projectService) : ControllerBase
{
    [HttpGet("my")]
    public async Task<IActionResult> GetMyProjects()
    {
        var userIdClaim = User.FindFirst("userId")?.Value;

        if (string.IsNullOrWhiteSpace(userIdClaim))
            return Unauthorized();

        var employeeId = Guid.Parse(userIdClaim);

        var projects = await projectService.GetProjectsForEmployeeAsync(employeeId);

        return Ok(projects);
    }
}
