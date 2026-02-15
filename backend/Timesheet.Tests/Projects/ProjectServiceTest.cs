using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Moq;
using Timesheet.Application.Projects.DTO;
using Timesheet.Domain.Entities;
using Timesheet.Domain.Enums;
using Timesheet.Infrastructure.Persistence;
using Timesheet.Infrastructure.Services.Project;

namespace Timesheet.Tests.Projects;

[TestFixture]
public class ProjectServiceTests
{
    private AppDbContext _context;
    private ProjectService _service;
    private Mock<IMapper> _mapperMock;

    private Guid _employee1;
    private Guid _employee2;

    [SetUp]
    public void Setup()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
                            .UseInMemoryDatabase(Guid.NewGuid().ToString())
                            .Options;

        _context = new AppDbContext(options);

        // Mock mapper
        _mapperMock = new Mock<IMapper>();
        _mapperMock.Setup(m => m.Map<Domain.Entities.Project>(It.IsAny<ProjectDto>()))
                    .Returns<ProjectDto>(dto => new Domain.Entities.Project
                    {
                        Name = dto.Name,
                        Code = dto.Code,
                        ClientName = dto.ClientName,
                        IsBillable = dto.IsBillable
                    });

        _service = new ProjectService(_context, _mapperMock.Object); // Mapper not needed for this method

        // Seed data
        _employee1 = Guid.NewGuid();
        _employee2 = Guid.NewGuid();

        var projects = new List<Project>
            {
                new Project { Id = 1, Name = "Project A", Code = "PA", ClientName = "Client 1", Status = ProjectStatus.Active, IsBillable = true },
                new Project { Id = 2, Name = "Project B", Code = "PB", ClientName = "Client 2", Status = ProjectStatus.Inactive, IsBillable = false },
                new Project { Id = 3, Name = "Project C", Code = "PC", ClientName = "Client 3", Status = ProjectStatus.Active, IsBillable = true },
            };

        var employeeProjects = new List<EmployeeProject>
            {
                new EmployeeProject { EmployeeId = _employee1, ProjectId = 1, Project = projects[0] },
                new EmployeeProject { EmployeeId = _employee1, ProjectId = 2, Project = projects[1] },
                new EmployeeProject { EmployeeId = _employee1, ProjectId = 3, Project = projects[2] },
                new EmployeeProject { EmployeeId = _employee2, ProjectId = 1, Project = projects[0] },
            };

        _context.Projects.AddRange(projects);
        _context.EmployeeProjects.AddRange(employeeProjects);
        _context.SaveChanges();
    }

    [TearDown]
    public void TearDown()
    {
        _context.Dispose();
    }

    [Test]
    public async Task GetProjectsForEmployeeAsync_ShouldReturnActiveProjectsForEmployee()
    {
        // Act
        var result = await _service.GetProjectsForEmployeeAsync(_employee1);

        // Assert
        Assert.That(result.Count, Is.EqualTo(2)); // Only active projects
        Assert.That(result.Any(p => p.Name == "Project A"), Is.True);
        Assert.That(result.Any(p => p.Name == "Project C"), Is.True);
        Assert.That(result.Any(p => p.Name == "Project B"), Is.False); // Inactive
    }

    [Test]
    public async Task GetProjectsForEmployeeAsync_ShouldReturnEmptyIfNoProjects()
    {
        // Act
        var result = await _service.GetProjectsForEmployeeAsync(Guid.NewGuid()); // employee with no projects

        // Assert
        Assert.That(result, Is.Empty);
    }

    [Test]
    public async Task CreateProject_ShouldAddProjectWithEmployees()
    {
        // Arrange
        var dto = new ProjectDto
        {
            Id = 0,
            Name = "New Project",
            Code = "NP001",
            ClientName = "Client X",
            IsBillable = true,
            EmployeeIds = new List<Guid> { _employee1, _employee2 }
        };

        // Act
        await _service.CreateProject(dto);

        // Assert
        var projectInDb = await _context.Projects
            .Include(p => p.EmployeeProjects)
            .FirstOrDefaultAsync(p => p.Name == "New Project");

        Assert.That(projectInDb, Is.Not.Null);
        Assert.That(projectInDb.Code, Is.EqualTo("NP001"));
        Assert.That(projectInDb.ClientName, Is.EqualTo("Client X"));
        Assert.That(projectInDb.IsBillable, Is.True);

        Assert.That(projectInDb.EmployeeProjects.Count, Is.EqualTo(2));
        Assert.That(projectInDb.EmployeeProjects.Any(ep => ep.EmployeeId == _employee1), Is.True);
        Assert.That(projectInDb.EmployeeProjects.Any(ep => ep.EmployeeId == _employee2), Is.True);

        // Verify that mapper.Map was called once
        _mapperMock.Verify(m => m.Map<Project>(dto), Times.Once);
    }

    [Test]
    public async Task UpdateProject_ShouldUpdateProjectAndEmployeeAssignments()
    {
        // Arrange
        var project = await _context.Projects
            .Include(p => p.EmployeeProjects)
            .FirstOrDefaultAsync(p => p.Name == "Project A");

        var dto = new ProjectDto
        {
            Id = project.Id,
            Name = "Updated Project A",
            Code = "UPA",
            ClientName = "Updated Client",
            IsBillable = false,
            EmployeeIds = new List<Guid> { _employee2 } // Remove _employee1, keep _employee2
        };

        // Setup mapper mock to map DTO to existing project
        _mapperMock.Setup(m => m.Map(dto, project))
                   .Callback<ProjectDto, Domain.Entities.Project>((d, p) =>
                   {
                       p.Name = d.Name;
                       p.Code = d.Code;
                       p.ClientName = d.ClientName;
                       p.IsBillable = d.IsBillable;
                   });

        // Act
        await _service.UpdateProject(dto);

        // Assert
        var updatedProject = await _context.Projects
            .Include(p => p.EmployeeProjects)
            .FirstOrDefaultAsync(p => p.Id == project.Id);

        Assert.That(updatedProject.Name, Is.EqualTo("Updated Project A"));
        Assert.That(updatedProject.Code, Is.EqualTo("UPA"));
        Assert.That(updatedProject.ClientName, Is.EqualTo("Updated Client"));
        Assert.That(updatedProject.IsBillable, Is.False);

        // Employee assignments updated
        Assert.That(updatedProject.EmployeeProjects.Count, Is.EqualTo(1));
        Assert.That(updatedProject.EmployeeProjects.Any(ep => ep.EmployeeId == _employee2), Is.True);
        Assert.That(updatedProject.EmployeeProjects.Any(ep => ep.EmployeeId == _employee1), Is.False);

        _mapperMock.Verify(m => m.Map(dto, project), Times.Once);
    }

    [Test]
    public void UpdateProject_ShouldThrow_WhenIdIsNull()
    {
        var dto = new ProjectDto
        {
            Id = null,
            Name = "Invalid Project"
        };

        var ex = Assert.ThrowsAsync<ArgumentException>(() => _service.UpdateProject(dto));
        Assert.That(ex!.Message, Is.EqualTo("Project Id is required for update"));
    }

    [Test]
    public void UpdateProject_ShouldThrow_WhenProjectNotFound()
    {
        var dto = new ProjectDto
        {
            Id = 999, // Non-existent project
            Name = "Non-existent Project"
        };

        var ex = Assert.ThrowsAsync<Exception>(() => _service.UpdateProject(dto));
        Assert.That(ex!.Message, Is.EqualTo("Project not found"));
    }

    [Test]
    public async Task Deactivate_ShouldSetProjectStatusToInactive()
    {
        // Arrange
        var project = await _context.Projects.FirstOrDefaultAsync(p => p.Name == "Project A");

        // Act
        await _service.Deactivate(project.Id);

        // Assert
        var updatedProject = await _context.Projects.FirstOrDefaultAsync(p => p.Id == project.Id);
        Assert.That(updatedProject.Status, Is.EqualTo(ProjectStatus.Inactive));
    }

    [Test]
    public void Deactivate_ShouldThrow_WhenProjectNotFound()
    {
        // Act & Assert
        var ex = Assert.ThrowsAsync<Exception>(() => _service.Deactivate(999));
        Assert.That(ex!.Message, Is.EqualTo("Project not found"));
    }

    [Test]
    public async Task Activate_ShouldSetProjectStatusToActive()
    {
        // Arrange
        var project = await _context.Projects.FirstOrDefaultAsync(p => p.Name == "Project B");
        project.Status = ProjectStatus.Inactive;
        await _context.SaveChangesAsync();

        // Act
        await _service.Activate(project.Id);

        // Assert
        var updatedProject = await _context.Projects.FirstOrDefaultAsync(p => p.Id == project.Id);
        Assert.That(updatedProject.Status, Is.EqualTo(ProjectStatus.Active));
    }

    [Test]
    public void Activate_ShouldThrow_WhenProjectNotFound()
    {
        // Act & Assert
        var ex = Assert.ThrowsAsync<Exception>(() => _service.Activate(999));
        Assert.That(ex!.Message, Is.EqualTo("Project not found"));
    }

    [Test]
    public async Task GetAllProjectsAsync_ShouldReturnOnlyNonDeletedProjects()
    {
        // Arrange
        // Seed a deleted project
        var deletedProject = new Project
        {
            Name = "Deleted Project",
            Code = "DEL",
            ClientName = "Client Del",
            IsBillable = false,
            Status = ProjectStatus.Deleted
        };
        _context.Projects.Add(deletedProject);
        await _context.SaveChangesAsync();

        // Act
        var result = await _service.GetAllProjectsAsync();

        // Assert
        // Deleted project should not be included
        Assert.That(result.Any(p => p.Name == "Deleted Project"), Is.False);

        // Other projects should be included
        Assert.That(result.Count, Is.EqualTo(_context.Projects.Count(p => p.Status != ProjectStatus.Deleted)));

        // Check mapping of properties
        var sample = result.First();
        var projectInDb = await _context.Projects.FirstAsync(p => p.Id == sample.Id);
        Assert.That(sample.Name, Is.EqualTo(projectInDb.Name));
        Assert.That(sample.Code, Is.EqualTo(projectInDb.Code));
        Assert.That(sample.ClientName, Is.EqualTo(projectInDb.ClientName));
        Assert.That(sample.IsBillable, Is.EqualTo(projectInDb.IsBillable));
        Assert.That(sample.Status, Is.EqualTo(projectInDb.Status));
    }

    [Test]
    public async Task GetEmployeesForManagerAsync_ShouldReturnEmployeesForManager()
    {
        // Arrange
        var managerId = Guid.NewGuid();
        var employee1 = Guid.NewGuid();
        var employee2 = Guid.NewGuid();
        var otherEmployee = Guid.NewGuid();

        // Seed Users
        _context.Users.AddRange(
            new User { Id = managerId, UserName = "Manager1" },
            new User { Id = employee1, UserName = "Employee1" },
            new User { Id = employee2, UserName = "Employee2" },
            new User { Id = otherEmployee, UserName = "Employee3" }
        );

        // Seed EmployeeManagers
        _context.EmployeeManagers.AddRange(
            new EmployeeManager { ManagerId = managerId, EmployeeId = employee1 },
            new EmployeeManager { ManagerId = managerId, EmployeeId = employee2 }
        );

        await _context.SaveChangesAsync();

        // Act
        var result = await _service.GetEmployeesForManagerAsync(managerId);

        // Assert
        Assert.That(result.Count, Is.EqualTo(2));
        Assert.That(result.Any(e => e.Id == employee1 && e.Name == "Employee1"), Is.True);
        Assert.That(result.Any(e => e.Id == employee2 && e.Name == "Employee2"), Is.True);
        Assert.That(result.Any(e => e.Id == otherEmployee), Is.False);
    }

    [Test]
    public async Task GetEmployeesForManagerAsync_ShouldReturnEmptyIfNoEmployees()
    {
        // Arrange
        var managerId = Guid.NewGuid(); // manager with no employees

        // Act
        var result = await _service.GetEmployeesForManagerAsync(managerId);

        // Assert
        Assert.That(result, Is.Empty);
    }

    [Test]
    public async Task GetEmployeesByProjectAsync_ShouldReturnEmployeesAssignedToProject()
    {
        // Arrange
        var projectId = 1;
        var employee1 = Guid.NewGuid();
        var employee2 = Guid.NewGuid();
        var otherEmployee = Guid.NewGuid();

        // Seed Users
        _context.Users.AddRange(
            new User { Id = employee1, UserName = "Employee1" },
            new User { Id = employee2, UserName = "Employee2" },
            new User { Id = otherEmployee, UserName = "Employee3" }
        );

        // Seed EmployeeProjects
        _context.EmployeeProjects.AddRange(
            new EmployeeProject { ProjectId = projectId, EmployeeId = employee1 },
            new EmployeeProject { ProjectId = projectId, EmployeeId = employee2 }
        );

        await _context.SaveChangesAsync();

        // Act
        var result = await _service.GetEmployeesByProjectAsync(projectId);

        // Assert
        Assert.That(result.Count, Is.EqualTo(2));
        Assert.That(result.Any(e => e.Id == employee1 && e.Name == "Employee1"), Is.True);
        Assert.That(result.Any(e => e.Id == employee2 && e.Name == "Employee2"), Is.True);
        Assert.That(result.Any(e => e.Id == otherEmployee), Is.False);
    }

    [Test]
    public async Task GetEmployeesByProjectAsync_ShouldReturnEmptyIfNoEmployeesAssigned()
    {
        // Arrange
        var projectId = 999; // non-existent project

        // Act
        var result = await _service.GetEmployeesByProjectAsync(projectId);

        // Assert
        Assert.That(result, Is.Empty);
    }
}
