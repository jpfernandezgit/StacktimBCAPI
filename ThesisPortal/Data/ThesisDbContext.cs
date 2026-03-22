using Microsoft.EntityFrameworkCore;
using ThesisPortal.Models;

namespace ThesisPortal.Data;

public class ThesisDbContext : DbContext
{
    public ThesisDbContext(DbContextOptions<ThesisDbContext> options) : base(options) { }

    public DbSet<Paper> Papers => Set<Paper>();
    public DbSet<Redaction> Redactions => Set<Redaction>();
    public DbSet<Researcher> Researchers => Set<Researcher>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Paper>(entity =>
        {
            entity.HasIndex(e => e.Title);
            entity.HasIndex(e => e.Year);
        });

        modelBuilder.Entity<Redaction>(entity =>
        {
            entity.HasIndex(e => e.Type);
            entity.HasIndex(e => e.Status);
        });

        modelBuilder.Entity<Researcher>(entity =>
        {
            entity.HasIndex(e => e.IsDoctorant);
        });

        // Seed data
        modelBuilder.Entity<Researcher>().HasData(
            new Researcher
            {
                Id = 1,
                Name = "Jean-Pierre Fernandez",
                Initials = "JF",
                Role = "Doctorant en Informatique",
                Affiliation = "Conservatoire National des Arts et Métiers (CNAM)",
                Bio = "Doctorant au CNAM, mes travaux de recherche se concentrent sur les systèmes distribués et la sécurité informatique.",
                IsDoctorant = true,
                Lab = "À définir",
                ThesisSubject = "À définir",
                StartDate = new DateTime(2025, 1, 1)
            },
            new Researcher
            {
                Id = 2,
                Name = "Directeur de Thèse",
                Initials = "DT",
                Role = "Directeur de thèse - Professeur des Universités",
                Affiliation = "CNAM",
                Bio = "À compléter",
                Expertise = "Systèmes distribués, Sécurité, Architecture logicielle",
                IsDoctorant = false
            },
            new Researcher
            {
                Id = 3,
                Name = "Co-encadrant",
                Initials = "CE",
                Role = "Co-encadrant - Maître de Conférences",
                Affiliation = "CNAM",
                Bio = "À compléter",
                Expertise = "Machine Learning, Analyse de données, Cloud Computing",
                IsDoctorant = false
            }
        );
    }
}
