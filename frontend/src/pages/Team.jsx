
export default function Team() {
  const team = [
    {
      name: "Sarah Loukkal",
      role: "Développement Frontend",
      initial: "S",
      color: "pink",
    },
    {
      name: "Amel",
      role: "Développement Frontend",
      initial: "A",
      color: "purple",
    },
    {
      name: "Hamza",
      role: "Développement Backend",
      initial: "H",
      color: "blue",
    },
    {
      name: "Reda",
      role: "Développement Backend",
      initial: "R",
      color: "peach",
    },
  ];

  return (
    <div className="team-grid">
      {team.map((member) => (
        <article className="member-card" key={member.name}>
          <div className={`member-avatar ${member.color}`}>
            {member.initial}
          </div>
          <h3>{member.name}</h3>
          <p>{member.role}</p>
          <span className="member-status">
            <span />
            Membre de l'équipe
          </span>
        </article>
      ))}
    </div>
  );
}
