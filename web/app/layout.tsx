import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
export const metadata: Metadata = { title: 'CtC — Consensus then Charity', description: 'Demand consensus first. Social charity next. Campus coordination on Monad.' };
export default function Layout({children}:{children:React.ReactNode}) {return <html lang="en"><body><AppProvider>{children}</AppProvider></body></html>}