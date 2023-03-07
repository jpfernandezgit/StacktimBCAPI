using System;
using System.Collections.Generic;

namespace StacktimBCAPI.Model;

public partial class Category
{
    public int IdCategorie { get; set; }

    public string? Descriptif { get; set; }

    public virtual ICollection<Connaissance> Connaissances { get; } = new List<Connaissance>();
}
