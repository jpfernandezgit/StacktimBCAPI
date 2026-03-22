using System.ComponentModel.DataAnnotations;

namespace ThesisPortal.Models;

public class Researcher
{
    public int Id { get; set; }

    [Required, MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(10)]
    public string Initials { get; set; } = string.Empty;

    [MaxLength(200)]
    public string? Role { get; set; }

    [MaxLength(300)]
    public string? Affiliation { get; set; }

    public string? Bio { get; set; }

    [MaxLength(500)]
    public string? Expertise { get; set; }

    [MaxLength(500)]
    public string? Website { get; set; }

    [MaxLength(500)]
    public string? LinkedIn { get; set; }

    [MaxLength(500)]
    public string? GoogleScholar { get; set; }

    public bool IsDoctorant { get; set; }

    [MaxLength(500)]
    public string? ThesisSubject { get; set; }

    [MaxLength(100)]
    public string? Lab { get; set; }

    public DateTime? StartDate { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public List<string> GetExpertiseList() =>
        string.IsNullOrWhiteSpace(Expertise)
            ? new List<string>()
            : Expertise.Split(',', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries).ToList();

    public void SetExpertiseList(List<string> items) =>
        Expertise = string.Join(", ", items);
}
