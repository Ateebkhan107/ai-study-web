import Leaderboard from "@/components/analytics/Leaderboard";

import { EXAM_CONFIG } from "@/lib/examConfig";
import StatsCards from "@/components/StatsCards";
import DashboardSection from "@/components/DashboardSection";
import DailyGoals from "@/components/DailyGoals";
import UserGreeting from "@/components/UserGreeting";
import { currentUser } from "@clerk/nextjs/server";
import { getUserProfile } from "@/lib/userProfile";

export default async function DashboardPage() {

const user = await currentUser();

const profile = await getUserProfile(user.id);

const activeTrackKey =
  profile?.exam === "NEET"
    ? "NEET"
    : "JEE";




  const activeConfig = {

    ...EXAM_CONFIG[activeTrackKey],

    dashboardTitle:

    activeTrackKey === "NEET"

    ?

    "NEET Overview"

    :

    "JEE Overview"

  };





  return (

    <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">


      <div>


        <p className="
        text-xs
        font-semibold
        text-gray-400
        uppercase
        tracking-widest
        mb-1
        ">


          {
          activeTrackKey === "NEET"

          ?

          "Good morning, Future Doctor 🩺"

          :

          "Good morning, Future Engineer 🚀"
          }


        </p>



       <UserGreeting />


        <p className="
        mt-1
        text-xs
        text-gray-400
        ">

          Keep improving every day.

        </p>


      </div>





      <DailyGoals />


      <StatsCards />



      <DashboardSection config={activeConfig}/>



      <div className="mt-8">


        <Leaderboard />


      </div>



    </div>

  );


}
