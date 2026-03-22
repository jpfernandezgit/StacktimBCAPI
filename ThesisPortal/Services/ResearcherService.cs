using Microsoft.EntityFrameworkCore;
using ThesisPortal.Data;
using ThesisPortal.Models;

namespace ThesisPortal.Services;

public class ResearcherService
{
    private readonly IDbContextFactory<ThesisDbContext> _factory;

    public ResearcherService(IDbContextFactory<ThesisDbContext> factory)
    {
        _factory = factory;
    }

    public async Task<Researcher?> GetDoctorantAsync()
    {
        using var db = await _factory.CreateDbContextAsync();
        return await db.Researchers.FirstOrDefaultAsync(r => r.IsDoctorant);
    }

    public async Task<List<Researcher>> GetEncadrantsAsync()
    {
        using var db = await _factory.CreateDbContextAsync();
        return await db.Researchers.Where(r => !r.IsDoctorant).OrderBy(r => r.Name).ToListAsync();
    }

    public async Task<List<Researcher>> GetAllAsync()
    {
        using var db = await _factory.CreateDbContextAsync();
        return await db.Researchers.OrderBy(r => r.Name).ToListAsync();
    }

    public async Task<Researcher?> GetByIdAsync(int id)
    {
        using var db = await _factory.CreateDbContextAsync();
        return await db.Researchers.FindAsync(id);
    }

    public async Task<Researcher> CreateAsync(Researcher researcher)
    {
        using var db = await _factory.CreateDbContextAsync();
        researcher.CreatedAt = DateTime.UtcNow;
        db.Researchers.Add(researcher);
        await db.SaveChangesAsync();
        return researcher;
    }

    public async Task UpdateAsync(Researcher researcher)
    {
        using var db = await _factory.CreateDbContextAsync();
        db.Researchers.Update(researcher);
        await db.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        using var db = await _factory.CreateDbContextAsync();
        var researcher = await db.Researchers.FindAsync(id);
        if (researcher is not null)
        {
            db.Researchers.Remove(researcher);
            await db.SaveChangesAsync();
        }
    }

    public async Task<int> GetCountAsync()
    {
        using var db = await _factory.CreateDbContextAsync();
        return await db.Researchers.CountAsync();
    }
}
