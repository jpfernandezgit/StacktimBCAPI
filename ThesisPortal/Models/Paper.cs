using System.ComponentModel.DataAnnotations;

namespace ThesisPortal.Models;

public class Paper
{
    public int Id { get; set; }

    [Required, MaxLength(500)]
    public string Title { get; set; } = string.Empty;

    [Required, MaxLength(500)]
    public string Authors { get; set; } = string.Empty;

    public int? Year { get; set; }

    [MaxLength(200)]
    public string? Venue { get; set; }

    [MaxLength(500)]
    public string? Tags { get; set; }

    public string? Summary { get; set; }

    public string? Notes { get; set; }

    public string? KeyFindings { get; set; }

    public DateTime? DateRead { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public List<string> GetTagsList() =>
        string.IsNullOrWhiteSpace(Tags)
            ? new List<string>()
            : Tags.Split(',', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries).ToList();

    public void SetTagsList(List<string> tags) =>
        Tags = string.Join(", ", tags);
}
