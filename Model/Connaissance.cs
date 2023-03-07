using System;
using System.Collections.Generic;

namespace StacktimBCAPI.Model;

public partial class Connaissance
{
    public int IdConnaissance { get; set; }

    public string? Nom { get; set; }

    public string? DescriptifCourt { get; set; }

    public string? DescriptifLong { get; set; }

    public int? Idcategorie { get; set; }

    public virtual ICollection<ConnaissancesProjet> ConnaissancesProjets { get; } = new List<ConnaissancesProjet>();

    public virtual Category? IdcategorieNavigation { get; set; }
}
