using System.ComponentModel.DataAnnotations;

namespace ThesisPortal.Models;

public enum RedactionType
{
    Chapitre,
    Article,
    Note
}

public enum RedactionStatus
{
    Brouillon,
    EnCours,
    Termine,
    Soumis
}

public class Redaction
{
    public int Id { get; set; }

    [Required, MaxLength(500)]
    public string Title { get; set; } = string.Empty;

    public RedactionType Type { get; set; } = RedactionType.Note;

    public RedactionStatus Status { get; set; } = RedactionStatus.Brouillon;

    [Range(0, 100)]
    public int Progress { get; set; }

    public string? Excerpt { get; set; }

    public string? Content { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public string StatusDisplay => Status switch
    {
        RedactionStatus.Brouillon => "Brouillon",
        RedactionStatus.EnCours => "En cours",
        RedactionStatus.Termine => "Terminé",
        RedactionStatus.Soumis => "Soumis",
        _ => Status.ToString()
    };

    public string StatusCssClass => Status switch
    {
        RedactionStatus.Brouillon => "warning",
        RedactionStatus.EnCours => "info",
        RedactionStatus.Termine => "success",
        RedactionStatus.Soumis => "purple",
        _ => "secondary"
    };
}
