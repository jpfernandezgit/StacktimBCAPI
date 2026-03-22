using Microsoft.EntityFrameworkCore;
using ThesisPortal.Data;
using ThesisPortal.Models;

namespace ThesisPortal.Services;

public class PaperService
{
    private readonly IDbContextFactory<ThesisDbContext> _factory;

    public PaperService(IDbContextFactory<ThesisDbContext> factory)
    {
        _factory = factory;
    }

    public async Task<List<Paper>> GetAllAsync()
    {
        using var db = await _factory.CreateDbContextAsync();
        return await db.Papers.OrderByDescending(p => p.DateRead ?? p.CreatedAt).ToListAsync();
    }

    public async Task<Paper?> GetByIdAsync(int id)
    {
        using var db = await _factory.CreateDbContextAsync();
        return await db.Papers.FindAsync(id);
    }

    public async Task<List<Paper>> SearchAsync(string? query, string? tag)
    {
        using var db = await _factory.CreateDbContextAsync();
        var papers = db.Papers.AsQueryable();

        if (!string.IsNullOrWhiteSpace(query))
        {
            var q = query.ToLower();
            papers = papers.Where(p =>
                p.Title.ToLower().Contains(q) ||
                p.Authors.ToLower().Contains(q) ||
                (p.Summary != null && p.Summary.ToLower().Contains(q)));
        }

        if (!string.IsNullOrWhiteSpace(tag))
        {
            papers = papers.Where(p => p.Tags != null && p.Tags.Contains(tag));
        }

        return await papers.OrderByDescending(p => p.DateRead ?? p.CreatedAt).ToListAsync();
    }

    public async Task<Paper> CreateAsync(Paper paper)
    {
        using var db = await _factory.CreateDbContextAsync();
        paper.CreatedAt = DateTime.UtcNow;
        paper.UpdatedAt = DateTime.UtcNow;
        db.Papers.Add(paper);
        await db.SaveChangesAsync();
        return paper;
    }

    public async Task UpdateAsync(Paper paper)
    {
        using var db = await _factory.CreateDbContextAsync();
        paper.UpdatedAt = DateTime.UtcNow;
        db.Papers.Update(paper);
        await db.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        using var db = await _factory.CreateDbContextAsync();
        var paper = await db.Papers.FindAsync(id);
        if (paper is not null)
        {
            db.Papers.Remove(paper);
            await db.SaveChangesAsync();
        }
    }

    public async Task<int> GetCountAsync()
    {
        using var db = await _factory.CreateDbContextAsync();
        return await db.Papers.CountAsync();
    }

    public async Task<List<string>> GetAllTagsAsync()
    {
        using var db = await _factory.CreateDbContextAsync();
        var allTags = await db.Papers
            .Where(p => p.Tags != null)
            .Select(p => p.Tags!)
            .ToListAsync();

        return allTags
            .SelectMany(t => t.Split(',', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries))
            .Distinct()
            .OrderBy(t => t)
            .ToList();
    }
}
