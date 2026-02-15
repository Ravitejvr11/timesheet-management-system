using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Timesheet.Application.Reports;
using Timesheet.Application.Timesheets.Interfaces;

namespace Timesheet.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReportController(ITimesheetService timesheetService) : ControllerBase
{
    [HttpGet("employee-wise-hours-summary")]
    public async Task<ActionResult<EmployeeProjectHoursSummary>> GetEmployeeProjectWiseSummary([FromBody] TimeReportFilter filter)
    {
        return Ok(await timesheetService.GetEmployeeProjectWiseSummary(filter));
    }

    [HttpGet("project-wise-hours-summary")]
    public async Task<ActionResult<ProjectHoursSummary>> GetProjectWiseHoursSummary([FromBody] TimeReportFilter filter)
    {
        return Ok(await timesheetService.GetProjectWiseHoursSummary(filter));
    }
}
