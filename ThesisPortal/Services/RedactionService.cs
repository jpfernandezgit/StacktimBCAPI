using Microsoft.EntityFrameworkCore;
using ThesisPortal.Data;
using ThesisPortal.Models;

namespace ThesisPortal.Services;

public class RedactionService
{
    private readonly IDbContextFactory<ThesisDbContext> _factory;

    public RedactionService(IDbContextFactory<ThesisDbContext> factory)
    {
        _factory = factory;
    }

    public async Task<List<Redaction>> GetAllAsync()
    {
        using var db = await _factory.CreateDbContextAsync();
        return await db.Redactions.OrderByDescending(r => r.UpdatedAt).ToListAsync();
    }

    public async Task<List<Redaction>> GetByTypeAsync(RedactionType type)
    {
        using var db = await _factory.CreateDbContextAsync();
        return await db.Redactions
            .Where(r => r.Type == type)
            .OrderByDescending(r => r.UpdatedAt)
            .ToListAsync();
    }

    public async Task<Redaction?> GetByIdAsync(int id)
    {
        using var db = await _factory.CreateDbContextAsync();
        return await db.Redactions.FindAsync(id);
    }

    public async Task<Redaction> CreateAsync(Redaction redaction)
    {
        using var db = await _factory.CreateDbContextAsync();
        redaction.CreatedAt = DateTime.UtcNow;
        redaction.UpdatedAt = DateTime.UtcNow;
        db.Redactions.Add(redaction);
        await db.SaveChangesAsync();
        return redaction;
    }

    public async Task UpdateAsync(Redaction redaction)
    {
        using var db = await _factory.CreateDbContextAsync();
        redaction.UpdatedAt = DateTime.UtcNow;
        db.Redactions.Update(redaction);
        await db.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        using var db = await _factory.CreateDbContextAsync();
        var redaction = await db.Redactions.FindAsync(id);
        if (redaction is not null)
        {
            db.Redactions.Remove(redaction);
            await db.SaveChangesAsync();
        }
    }

    public async Task<int> GetCountAsync()
    {
        using var db = await _factory.CreateDbContextAsync();
        return await db.Redactions.CountAsync();
    }
}
