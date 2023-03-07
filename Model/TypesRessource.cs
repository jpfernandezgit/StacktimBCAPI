using System;
using System.Collections.Generic;

namespace StacktimBCAPI.Model;

public partial class TypesRessource
{
    public int IdTypeRessource { get; set; }

    public string? Descriptif { get; set; }

    public string? Image { get; set; }

    public virtual ICollection<Ressource> Ressources { get; } = new List<Ressource>();
}
