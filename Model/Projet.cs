using System;
using System.Collections.Generic;

namespace StacktimBCAPI.Model;

public partial class Projet
{
    public int IdProjet { get; set; }

    public DateTime? DateCreation { get; set; }

    public string? Etat { get; set; }

    public string? CreePar { get; set; }

    public string? Contenu { get; set; }

    public virtual ICollection<ConnaissancesProjet> ConnaissancesProjets { get; } = new List<ConnaissancesProjet>();
}
