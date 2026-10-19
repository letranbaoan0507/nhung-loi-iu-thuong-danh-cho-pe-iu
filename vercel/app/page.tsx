import { getChatGPTUser, chatGPTSignInPath } from './chatgpt-auth';
import StudioClient from './studio-client';
export const dynamic='force-dynamic';
export default async function Home(){const user=await getChatGPTUser();return <StudioClient canSave={!!user} signinPath={chatGPTSignInPath('/')}/>;}
