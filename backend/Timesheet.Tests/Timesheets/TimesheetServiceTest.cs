namespace Timesheet.Tests.Timesheets;

using Microsoft.EntityFrameworkCore;
using Moq;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Timesheet.Application.Timesheets.DTO;
using Timesheet.Application.Timesheets.Strategies;
using Timesheet.Domain.Entities;
using Timesheet.Domain.Enums;
using Timesheet.Infrastructure.Persistence;
using Timesheet.Infrastructure.Services.Timesheet;

[TestFixture]
public class TimesheetServiceTests
{
    private AppDbContext _context;
    private TimesheetService _service;
    private Mock<ITimesheetStatusStrategy> _strategyMock;
    private Guid _employee1;
    private Guid _employee2;

    [SetUp]
    public void Setup()
    {
        // Setup in-memory database
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString()) // unique DB per test
            .Options;

        _context = new AppDbContext(options);

        // Seed data
        _employee1 = Guid.NewGuid();
        _employee2 = Guid.NewGuid();

        var project1 = new Project { Id = 1, Name = "Project A" };
        var project2 = new Project { Id = 2, Name = "Project B" };
        _context.Projects.AddRange(project1, project2);

        var ts1 = new Timesheet
        {
            Id = 1,
            EmployeeId = _employee1,
            ProjectId = 1,
            WeekStartDate = new DateOnly(2026, 2, 10),
            WeekEndDate = new DateOnly(2026, 2, 16),
            Entries = new List<TimesheetEntry>
            {
                new TimesheetEntry { WorkDate = new DateOnly(2026, 2, 10), BillableHours = 5, NonBillableHours = 2 }
            }
        };

        var ts2 = new Timesheet
        {
            Id = 2,
            EmployeeId = _employee1,
            ProjectId = 1,
            WeekStartDate = new DateOnly(2026, 2, 17), // latest week
            WeekEndDate = new DateOnly(2026, 2, 23),
            Entries = new List<TimesheetEntry>
            {
                new TimesheetEntry { WorkDate = new DateOnly(2026, 2, 17), BillableHours = 4, NonBillableHours = 1 }
            }
        };

        var ts3 = new Timesheet
        {
            Id = 3,
            EmployeeId = _employee2,
            ProjectId = 1,
            WeekStartDate = new DateOnly(2026, 2, 17),
        };

        var ts4 = new Timesheet
        {
            Id = 4,
            EmployeeId = _employee1,
            ProjectId = 2, // different project
        };

        _context.Timesheets.AddRange(ts1, ts2, ts3, ts4);
        _context.SaveChanges();

        // Mock strategies
        _strategyMock = new Mock<ITimesheetStatusStrategy>();

        // By default, CanHandle returns true for Draft
        _strategyMock.Setup(s => s.CanHandle(It.IsAny<TimesheetStatus>())).Returns<TimesheetStatus>(status => status == TimesheetStatus.Draft);
        _strategyMock.Setup(s => s.Apply(It.IsAny<Timesheet>(), It.IsAny<Guid>(), null));

        var strategies = new List<ITimesheetStatusStrategy> { _strategyMock.Object };

        // Create service
        _service = new TimesheetService(_context, strategies);
    }

    [TearDown]
    public void TearDown()
    {
        _context.Dispose();
    }

    [Test]
    public async Task GetTimesheetsForEmployeeAsync_ShouldReturnOnlyMatchingEmployeeAndProject()
    {
        var result = await _service.GetTimesheetsForEmployeeAsync(_employee1, 1);

        Assert.That(result.Count, Is.EqualTo(2)); // only two matching timesheets
        Assert.That(result.All(t => t.Entries != null), Is.True);
    }

    [Test]
    public async Task GetTimesheetsForEmployeeAsync_ShouldReturnOrderedByWeekStartDateDesc()
    {
        var result = await _service.GetTimesheetsForEmployeeAsync(_employee1, 1);

        Assert.That(result[0].WeekStartDate, Is.EqualTo(new DateOnly(2026, 2, 17)));
        Assert.That(result[1].WeekStartDate, Is.EqualTo(new DateOnly(2026, 2, 10)));
    }

    [Test]
    public async Task GetTimesheetsForEmployeeAsync_ShouldIncludeEntries()
    {
        var result = await _service.GetTimesheetsForEmployeeAsync(_employee1, 1);

        Assert.That(result[0].Entries.Count, Is.GreaterThan(0));
        Assert.That(result[1].Entries.Count, Is.GreaterThan(0));
    }

    [Test]
    public async Task GetTimesheetsForEmployeeAsync_ShouldNotReturnOtherEmployees()
    {
        var result = await _service.GetTimesheetsForEmployeeAsync(_employee2, 1);

        Assert.That(result.Count, Is.EqualTo(1));
        Assert.That(result[0].EmployeeId, Is.EqualTo(_employee2));
    }

    [Test]
    public async Task GetTimesheetsForEmployeeAsync_ShouldNotReturnOtherProjects()
    {
        var result = await _service.GetTimesheetsForEmployeeAsync(_employee1, 2);

        Assert.That(result.Count, Is.EqualTo(1));
        Assert.That(result[0].ProjectId, Is.EqualTo(2));
    }

    [Test]
    public async Task GetTimesheetsForEmployeeAsync_ShouldReturnEmpty_WhenNoMatch()
    {
        var result = await _service.GetTimesheetsForEmployeeAsync(Guid.NewGuid(), 99);

        Assert.That(result, Is.Empty);
    }

    [Test]
    public async Task CreateTimesheetAsync_ShouldCreateNewTimesheet()
    {
        // Arrange
        var request = new CreateTimesheetRequest()
        {
            ProjectId = 1,
            WeekStartDate = new DateOnly(2026, 3, 1),
            WeekEndDate = new DateOnly(2026, 3, 7)
        };

        var employeeId = Guid.NewGuid();

        // Act
        var result = await _service.CreateTimesheetAsync(employeeId, request);

        // Assert
        Assert.That(result, Is.Not.Null);
        Assert.That(result.EmployeeId, Is.EqualTo(employeeId));
        Assert.That(result.ProjectId, Is.EqualTo(request.ProjectId));
        Assert.That(result.WeekStartDate, Is.EqualTo(request.WeekStartDate));
        Assert.That(result.WeekEndDate, Is.EqualTo(request.WeekEndDate));
        Assert.That(result.Status, Is.EqualTo(TimesheetStatus.Draft));

        // Verify that it is actually saved in the database
        var timesheetInDb = await _context.Timesheets.FindAsync(result.Id);
        Assert.That(timesheetInDb, Is.Not.Null);
        Assert.That(timesheetInDb.EmployeeId, Is.EqualTo(employeeId));
    }

    [Test]
    public async Task UpdateTimesheetAsync_ShouldUpdateDraftTimesheetWithNewEntries()
    {
        // Arrange
        var employeeId = _employee1;
        var timesheet = new Timesheet
        {
            EmployeeId = employeeId,
            ProjectId = 1,
            WeekStartDate = new DateOnly(2026, 2, 1),
            WeekEndDate = new DateOnly(2026, 2, 7),
            Status = TimesheetStatus.Draft,
            Entries = new List<TimesheetEntry>
        {
            new TimesheetEntry { WorkDate = new DateOnly(2026, 2, 2), BillableHours = 5 }
        }
        };
        _context.Timesheets.Add(timesheet);
        await _context.SaveChangesAsync();

        var request = new UpdateTimesheetRequest()
        {
            WeekStartDate = new DateOnly(2026, 2, 3),
            WeekEndDate = new DateOnly(2026, 2, 9),
            Entries = new List<UpsertTimesheetEntryRequest>()
            {
                new UpsertTimesheetEntryRequest() {
                    WorkDate = new DateOnly(2026, 2, 4),
                    BillableHours = 4,
                    NonBillableHours =  1,
                    Description = "Updated work"
                }
            }
        };

        // Act
        var result = await _service.UpdateTimesheetAsync(employeeId, timesheet.Id, request);

        // Assert
        Assert.That(result.WeekStartDate, Is.EqualTo(request.WeekStartDate));
        Assert.That(result.WeekEndDate, Is.EqualTo(request.WeekEndDate));
        Assert.That(result.Entries.Count, Is.EqualTo(1));
        Assert.That(result.Entries[0].BillableHours, Is.EqualTo(4));

        var tsInDb = await _context.Timesheets.Include(t => t.Entries).FirstAsync(t => t.Id == timesheet.Id);
        Assert.That(tsInDb.Status, Is.EqualTo(TimesheetStatus.Draft));
        Assert.That(tsInDb.Entries.Count, Is.EqualTo(1));
    }

    [Test]
    public async Task UpdateTimesheetAsync_ShouldResetRejectedStatusToDraft()
    {
        // Arrange
        var employeeId = _employee1;
        var timesheet = new Timesheet
        {
            EmployeeId = employeeId,
            ProjectId = 1,
            Status = TimesheetStatus.Rejected,
            Comments = "Some reason",
            WeekStartDate = new DateOnly(2026, 2, 1),
            WeekEndDate = new DateOnly(2026, 2, 7)
        };
        _context.Timesheets.Add(timesheet);
        await _context.SaveChangesAsync();

        var request = new UpdateTimesheetRequest()
        {
            WeekStartDate = new DateOnly(2026, 2, 3),
            WeekEndDate = new DateOnly(2026, 2, 9),
            Entries = null
        };

        // Act
        var result = await _service.UpdateTimesheetAsync(employeeId, timesheet.Id, request);

        // Assert
        Assert.That(result.Status, Is.EqualTo(TimesheetStatus.Draft));
        Assert.That(result.Comments, Is.Null);

        var tsInDb = await _context.Timesheets.FindAsync(timesheet.Id);
        Assert.That(tsInDb.Status, Is.EqualTo(TimesheetStatus.Draft));
        Assert.That(tsInDb.Comments, Is.Null);
    }

    [Test]
    public void UpdateTimesheetAsync_ShouldThrow_WhenTimesheetCannotBeEdited()
    {
        // Arrange
        var employeeId = _employee1;
        var timesheet = new Timesheet
        {
            EmployeeId = employeeId,
            ProjectId = 1,
            Status = TimesheetStatus.Submitted
        };
        _context.Timesheets.Add(timesheet);
        _context.SaveChanges();

        var request = new UpdateTimesheetRequest()
        {
            WeekStartDate = new DateOnly(2026, 2, 3),
            WeekEndDate = new DateOnly(2026, 2, 9)
        };

        // Act & Assert
        Assert.ThrowsAsync<Exception>(async () =>
            await _service.UpdateTimesheetAsync(employeeId, timesheet.Id, request),
            "Timesheet cannot be edited."
        );
    }

    [Test]
    public void UpdateTimesheetAsync_ShouldThrow_WhenTimesheetNotFound()
    {
        // Arrange
        var employeeId = _employee1;
        var request = new UpdateTimesheetRequest()
        {
            WeekStartDate = new DateOnly(2026, 2, 3),
            WeekEndDate = new DateOnly(2026, 2, 9)
        };

        // Act & Assert
        Assert.ThrowsAsync<Exception>(async () =>
            await _service.UpdateTimesheetAsync(employeeId, 999, request),
            "Timesheet not found."
        );
    }

    [Test]
    public async Task SubmitTimesheetAsync_ShouldCallStrategyApply_WhenValid()
    {
        // Arrange
        var employeeId = Guid.NewGuid();
        var timesheet = new Timesheet
        {
            EmployeeId = employeeId,
            ProjectId = 1,
            Status = TimesheetStatus.Draft
        };
        _context.Timesheets.Add(timesheet);
        await _context.SaveChangesAsync();

        // Act
        await _service.SubmitTimesheetAsync(employeeId, timesheet.Id);

        // Assert
        _strategyMock.Verify(
            s => s.Apply(
                It.Is<Timesheet>(t => t.Id == timesheet.Id),
                It.Is<Guid>(id => id == employeeId), null),
            Times.Once
        );
    }

    [Test]
    public void SubmitTimesheetAsync_ShouldThrow_WhenTimesheetNotFound()
    {
        // Arrange
        var service = new TimesheetService(_context, new ITimesheetStatusStrategy[] { });

        // Act & Assert
        Assert.ThrowsAsync<Exception>(async () =>
            await service.SubmitTimesheetAsync(Guid.NewGuid(), 999),
            "Timesheet not found."
        );
    }

    [Test]
    public async Task SubmitTimesheetAsync_ShouldThrow_WhenNoValidStrategy()
    {
        // Arrange
        var employeeId = _employee1;
        var timesheet = new Timesheet
        {
            EmployeeId = employeeId,
            ProjectId = 1,
            Status = TimesheetStatus.Draft
        };
        _context.Timesheets.Add(timesheet);
        await _context.SaveChangesAsync();

        // Mock strategy that cannot handle Draft
        var strategyMock = new Mock<ITimesheetStatusStrategy>();
        strategyMock.Setup(s => s.CanHandle(TimesheetStatus.Submitted)).Returns(true);

        var service = new TimesheetService(_context, new[] { strategyMock.Object });

        // Act & Assert
        var ex = Assert.ThrowsAsync<Exception>(async () =>
            await service.SubmitTimesheetAsync(employeeId, timesheet.Id));

        Assert.That(ex!.Message, Is.EqualTo("Invalid timesheet state transition."));
    }

}

