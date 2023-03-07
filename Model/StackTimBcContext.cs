using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace StacktimBCAPI.Model;

public partial class StackTimBcContext : DbContext
{
    public StackTimBcContext()
    {
    }

    public StackTimBcContext(DbContextOptions<StackTimBcContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Category> Categories { get; set; }

    public virtual DbSet<Connaissance> Connaissances { get; set; }

    public virtual DbSet<ConnaissancesProjet> ConnaissancesProjets { get; set; }

    public virtual DbSet<Projet> Projets { get; set; }

    public virtual DbSet<Ressource> Ressources { get; set; }

    public virtual DbSet<TypesRessource> TypesRessources { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see http://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseSqlServer("Data Source= JPF-LEGION\\SQL2019;Trusted_Connection=true ;Initial Catalog=StackTimBC; Encrypt=false");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasKey(e => e.IdCategorie).HasName("PK__Categori__A3C02A1CA5EB4A01");

            entity.Property(e => e.Descriptif)
                .HasMaxLength(50)
                .IsUnicode(false);
        });

        modelBuilder.Entity<Connaissance>(entity =>
        {
            entity.HasKey(e => e.IdConnaissance).HasName("PK__Connaiss__D9C10E98B1D8425C");

            entity.Property(e => e.DescriptifCourt)
                .HasMaxLength(500)
                .IsUnicode(false);
            entity.Property(e => e.DescriptifLong).IsUnicode(false);
            entity.Property(e => e.Idcategorie).HasColumnName("IDCategorie");
            entity.Property(e => e.Nom)
                .HasMaxLength(50)
                .IsUnicode(false);

            entity.HasOne(d => d.IdcategorieNavigation).WithMany(p => p.Connaissances)
                .HasForeignKey(d => d.Idcategorie)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK__Connaissa__IDCat__267ABA7A");
        });

        modelBuilder.Entity<ConnaissancesProjet>(entity =>
        {
            entity.HasKey(e => e.IdConnsancesProjets).HasName("PK__Connaiss__DBD6CFE7DF5EDE01");

            entity.HasOne(d => d.IdConnaissanceNavigation).WithMany(p => p.ConnaissancesProjets)
                .HasForeignKey(d => d.IdConnaissance)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK__Connaissa__IdCon__33D4B598");

            entity.HasOne(d => d.IdProjetNavigation).WithMany(p => p.ConnaissancesProjets)
                .HasForeignKey(d => d.IdProjet)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK__Connaissa__IdPro__34C8D9D1");
        });

        modelBuilder.Entity<Projet>(entity =>
        {
            entity.HasKey(e => e.IdProjet).HasName("PK__Projets__7BA5D40E9A7969C4");

            entity.Property(e => e.Contenu).IsUnicode(false);
            entity.Property(e => e.CreePar)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.Etat)
                .HasMaxLength(20)
                .IsUnicode(false);
        });

        modelBuilder.Entity<Ressource>(entity =>
        {
            entity.HasKey(e => e.IdRessource).HasName("PK__Ressourc__8BB45FB885A47014");

            entity.Property(e => e.Contenu).IsUnicode(false);
            entity.Property(e => e.CreePar)
                .HasMaxLength(50)
                .IsUnicode(false);

            entity.HasOne(d => d.IdTypeRessourceNavigation).WithMany(p => p.Ressources)
                .HasForeignKey(d => d.IdTypeRessource)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK__Ressource__IdTyp__2B3F6F97");
        });

        modelBuilder.Entity<TypesRessource>(entity =>
        {
            entity.HasKey(e => e.IdTypeRessource).HasName("PK__TypesRes__583EC3FB8D4929DE");

            entity.Property(e => e.Descriptif).IsUnicode(false);
            entity.Property(e => e.Image).IsUnicode(false);
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
