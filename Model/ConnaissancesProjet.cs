using System;
using System.Collections.Generic;

namespace StacktimBCAPI.Model;

public partial class ConnaissancesProjet
{
    public int IdConnsancesProjets { get; set; }

    public int? IdConnaissance { get; set; }

    public int? IdProjet { get; set; }

    public virtual Connaissance? IdConnaissanceNavigation { get; set; }

    public virtual Projet? IdProjetNavigation { get; set; }
}
