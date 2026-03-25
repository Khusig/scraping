import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div style={{display:"flex",justifyContent:"center",marginTop:"100px"}}>
      <SignUp fallbackRedirectUrl={"/setup"} forceRedirectUrl={"/setup"} />
    </div>
  );
}
