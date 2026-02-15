using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Timesheet.Application.Projects.DTO;
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

    [HttpGet]
    [Authorize(Roles = "Manager")]
    public async Task<IActionResult> GetAll()
    {
        var projects = await projectService.GetAllProjectsAsync();
        return Ok(projects);
    }

    [HttpPost]
    [Authorize(Roles = "Manager")]
    public async Task<IActionResult> Create([FromBody] ProjectDto dto)
    {
        await projectService.CreateProject(dto);
        return Ok();
    }

    [HttpPut]
    [Authorize(Roles = "Manager")]
    public async Task<IActionResult> Update([FromBody] ProjectDto dto)
    {
        await projectService.UpdateProject(dto);
        return Ok();
    }

    [HttpPatch("{id:int}/activate")]
    [Authorize(Roles = "Manager")]
    public async Task<IActionResult> Activate(int id)
    {
        await projectService.Activate(id);
        return NoContent();
    }

    [HttpPatch("{id:int}/deactivate")]
    [Authorize(Roles = "Manager")]
    public async Task<IActionResult> Deactivate(int id)
    {
        await projectService.Deactivate(id);
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Manager")]
    public async Task<IActionResult> Delete(int id)
    {
        await projectService.Delete(id);
        return NoContent();
    }

    [HttpGet("employees")]
    [Authorize(Roles = "Manager")]
    public async Task<IActionResult> GetEmployeesForManager()
    {
        var userIdClaim = User.FindFirst("userId")?.Value;

        if (string.IsNullOrWhiteSpace(userIdClaim))
            return Unauthorized();

        var managerId = Guid.Parse(userIdClaim);

        var employees = await projectService.GetEmployeesForManagerAsync(managerId);

        return Ok(employees);
    }

    [HttpGet("{projectId:int}/employees")]
    [Authorize(Roles = "Manager")]
    public async Task<IActionResult> GetEmployeesByProject(int projectId)
    {
        var employees = await projectService.GetEmployeesByProjectAsync(projectId);
        return Ok(employees);
    }
}
