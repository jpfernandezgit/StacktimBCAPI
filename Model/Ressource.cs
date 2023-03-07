using System;
using System.Collections.Generic;

namespace StacktimBCAPI.Model;

public partial class Ressource
{
    public int IdRessource { get; set; }

    public DateTime? DatePublication { get; set; }

    public string? CreePar { get; set; }

    public string? Contenu { get; set; }

    public int? IdTypeRessource { get; set; }

    public virtual TypesRessource? IdTypeRessourceNavigation { get; set; }
}
