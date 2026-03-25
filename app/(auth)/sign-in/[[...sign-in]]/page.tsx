//import { SignIn } from "@clerk/nextjs";

//export default function Page() {
  //return <SignIn />;
//}

import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div style={{display:"flex",justifyContent:"center",marginTop:"100px"}}>
      <SignIn fallbackRedirectUrl={"/setup"} forceRedirectUrl={"/setup"} />
    </div>
  );
}
