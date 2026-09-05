const PLANS = [
  {
    id: "npc",
    name: "NPC",
    price: "$0/month",
    features: ["Proyectos y tecnologías simultáneas limitadas", "Colaboración limitada", "Enfrentamientos solo contra tu equipo"],
  },
  {
    id: "giga_chad",
    name: "Giga Chad",
    price: "$10/month",
    features: ["Proyectos y tecnologías ilimitadas", "Colaboración sin límite", "Enfrentamientos contra IA"],
  },
];

export default function BillingPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Discover the prices we have for you</h1>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {PLANS.map((plan) => (
          <div key={plan.id} className="rounded-md border border-neutral-800 p-6">
            <h2 className="text-lg font-medium">{plan.name}</h2>
            <p className="mt-1 text-2xl font-semibold">{plan.price}</p>
            <ul className="mt-4 flex flex-col gap-2 text-sm text-neutral-400">
              {plan.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
