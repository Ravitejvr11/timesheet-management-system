using AutoMapper;
using Timesheet.Application.Projects.DTO;
using Timesheet.Domain.Entities;

namespace Timesheet.API.AutoMapper;

public class AutoMapperConfig : Profile
{
    public AutoMapperConfig()
    {
        // DTO -> Entity
        CreateMap<ProjectDto, Project>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.EmployeeProjects, opt => opt.Ignore());

        // Entity -> DTO
        CreateMap<Project, ProjectDto>()
            .ForMember(dest => dest.EmployeeIds,
                opt => opt.MapFrom(src => src.EmployeeProjects.Select(ep => ep.EmployeeId)));
    }
}
