import {
   Clock3,
   ShieldCheck,
   UserRoundCheck,
   UsersRound,
} from "lucide-react";

type StatsGridProps = {
   totalAssistants: number;
   presentToday: number;
   inProgressToday: number;
   completedToday: number;
};

export const StatsGrid = ({
   totalAssistants,
   presentToday,
   inProgressToday,
   completedToday,
}: StatsGridProps) => {
   const stats = [
      {
         label: "Total Assistants",
         value: totalAssistants,
         icon: <UsersRound size={24} />,
      },
      {
         label: "Present Today",
         value: presentToday,
         icon: <UserRoundCheck size={24} />,
      },
      {
         label: "In Progress",
         value: inProgressToday,
         icon: <Clock3 size={24} />,
      },
      {
         label: "Completed",
         value: completedToday,
         icon: <ShieldCheck size={24} />,
      },
   ];

   return (
      <div className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 lg:grid lg:grid-cols-4 lg:gap-3 lg:overflow-visible">
         {stats.map((stat) => (
            <div
               key={stat.label}
               className="min-h-34 min-w-[300px] shrink-0 snap-center rounded-xl border border-(--pertama) bg-(--kesembilan) p-6 lg:min-w-0 lg:w-auto lg:p-8"
            >
               <div className="flex items-start justify-between gap-4">
                  <div>
                     <p className="text-base font-medium text-(--keenam)">
                        {stat.label}
                     </p>

                     <h2 className="mt-5 text-4xl font-semibold text-(--pertama)">
                        {stat.value}
                     </h2>
                  </div>

                  <div className="text-(--pertama)">
                     {stat.icon}
                  </div>
               </div>
            </div>
         ))}
      </div>
   );
};
