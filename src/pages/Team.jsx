
export default function Team({ members = [] }) {
  const colors = ["pink", "purple", "blue", "peach"];

  return (
    <div className="team-grid">
      {members.map(({ user, role }, index) => {
        const name = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;
        return <article className="member-card" key={user.id}>
          <div className={`member-avatar ${colors[index % colors.length]}`}>
            {name[0]?.toUpperCase()}
          </div>
          <h3>{name}</h3>
          <p>{role.replaceAll("_", " ")}</p>
          <span className="member-status">
            <span />
            Membre de l'équipe
          </span>
        </article>;
      })}
      {members.length === 0 && <p className="empty-state">Aucun membre dans cette équipe.</p>}
    </div>
  );
}
