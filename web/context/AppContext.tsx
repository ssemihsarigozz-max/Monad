"use client";

import { BrowserProvider, Contract, formatEther, parseEther } from "ethers";
import { createContext, ReactNode, useContext, useEffect, useRef, useState } from "react";
import { COMMON_GROUND_ABI, COMMON_GROUND_ADDRESS, MONAD_CHAIN_ID, MONAD_CHAIN_HEX } from "@/lib/contract";

type Stage = "locked" | "active" | "successful" | "failed";
export type Slot = { id: string; number: number; count: number; stage: Stage; deadline: number; claimed: boolean; pledge: number };
export const services = ["Central Library", "Laundry Hub", "Night Cafeteria"];
type Activity = { id: string; service: string; slot: string; kind: "support" | "refund"; amount: number; time: string };
type State = { connected: boolean; address: string; balance: number; actualBalance: number | null; network: string; active: number; slots: Slot[][]; treasury: number; history: Activity[] };
type Eip1193Provider = { request: (args: { method: string; params?: unknown[] }) => Promise<unknown>; on?: (event: string, handler: (...args: unknown[]) => void) => void; removeListener?: (event: string, handler: (...args: unknown[]) => void) => void };
declare global { interface Window { ethereum?: Eip1193Provider } }

const blankSlots = (): Slot[][] => services.map((_, serviceId) => [0, 1, 2].map((slotIndex) => ({ id: `${serviceId}-${slotIndex}`, number: slotIndex + 1, count: 0, stage: slotIndex === 0 ? "active" : "locked", deadline: 0, claimed: false, pledge: 0 })));
const fresh = (): State => ({ connected: false, address: "", balance: 0, actualBalance: null, network: "Monad Testnet", active: 0, treasury: 0, history: [], slots: blankSlots() });
const stageFor = (status: bigint): Stage => ["locked", "active", "successful", "failed"][Number(status)] as Stage;
const Context = createContext<null | { state: State; now: number; busy: boolean; toast: string | null; notify: (message: string) => void; connect: () => Promise<void>; select: (service: number) => void; support: (id: string) => Promise<void>; refund: (id: string) => Promise<void>; finalize: (serviceId: number) => Promise<void>; refresh: () => Promise<void> }>(null);

function provider() { if (!window.ethereum) throw new Error("MetaMask bulunamadı. Tarayıcı eklentisini açıp tekrar deneyin."); return new BrowserProvider(window.ethereum); }
function contract(runner: BrowserProvider | Awaited<ReturnType<BrowserProvider["getSigner"]>>) { return new Contract(COMMON_GROUND_ADDRESS, COMMON_GROUND_ABI, runner); }
function readableError(error: unknown) { const candidate = error as { shortMessage?: string; info?: { error?: { message?: string } }; message?: string }; return candidate.shortMessage || candidate.info?.error?.message || candidate.message || "İşlem tamamlanamadı."; }

export function AppProvider({ children }: { children: ReactNode }) {
 const [state, setState] = useState<State>(fresh); const [now, setNow] = useState(Date.now()); const [toast, setToast] = useState<string | null>(null); const [busy, setBusy] = useState(false); const ref = useRef(state); ref.current = state;
 const notify = (message: string) => setToast(message); const commit = (next: State) => { ref.current = next; setState(next); };
 const refresh = async () => {
  if (!window.ethereum) return;
  const accounts = await window.ethereum.request({ method: "eth_accounts" }) as string[]; const chain = await window.ethereum.request({ method: "eth_chainId" });
  if (!accounts[0] || chain !== MONAD_CHAIN_HEX) { commit({ ...ref.current, connected: false, address: "", balance: 0, actualBalance: null }); return; }
  const browserProvider = provider(); const live = contract(browserProvider);
  const [balance, accrued, serviceData] = await Promise.all([browserProvider.getBalance(accounts[0]), live.impactAccrued(), Promise.all(services.map((_, serviceId) => live.getService(serviceId)))]);
  const slots = await Promise.all(serviceData.map(async (service, serviceId) => Promise.all([0, 1, 2].map(async (slotIndex) => {
   const [slot, supported] = await Promise.all([live.getSlot(serviceId, slotIndex), live.hasSupported(serviceId, slotIndex, accounts[0])]);
   return { id: `${serviceId}-${slotIndex}`, number: slotIndex + 1, count: Number(slot[1]), stage: stageFor(slot[0]), deadline: Number(service[0]) * 1000, claimed: false, pledge: supported ? 1 : 0 };
  }))));
  commit({ ...ref.current, connected: true, address: accounts[0], balance: Number(formatEther(balance)), actualBalance: Number(formatEther(balance)), network: "Monad Testnet", treasury: Number(formatEther(accrued)), slots });
 };
 useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer); }, []);
 useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(null), 5000); return () => clearTimeout(timer); }, [toast]);
 useEffect(() => { const changed = () => { void refresh(); notify("Cüzdan değişti; zincir verileri yenilendi."); }; window.ethereum?.on?.("accountsChanged", changed); window.ethereum?.on?.("chainChanged", changed); void refresh(); return () => { window.ethereum?.removeListener?.("accountsChanged", changed); window.ethereum?.removeListener?.("chainChanged", changed); }; }, []);
 async function connect() { setBusy(true); try {
  if (!window.ethereum) throw new Error("MetaMask bulunamadı. Tarayıcı eklentisini açıp tekrar deneyin."); await window.ethereum.request({ method: "eth_requestAccounts" }); let chain = await window.ethereum.request({ method: "eth_chainId" });
  if (chain !== MONAD_CHAIN_HEX) { try { await window.ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: MONAD_CHAIN_HEX }] }); } catch (error) { if ((error as { code?: number }).code !== 4902) throw error; await window.ethereum.request({ method: "wallet_addEthereumChain", params: [{ chainId: MONAD_CHAIN_HEX, chainName: "Monad Testnet", nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 }, rpcUrls: ["https://testnet-rpc.monad.xyz"], blockExplorerUrls: ["https://testnet.monadexplorer.com"] }] }); } chain = await window.ethereum.request({ method: "eth_chainId" }); }
  if (chain !== MONAD_CHAIN_HEX) throw new Error(`Monad Testnet (chain ${MONAD_CHAIN_ID}) seçilmedi.`); await refresh(); notify("Cüzdan Monad Testnet'e bağlandı.");
 } catch (error) { notify(readableError(error)); } finally { setBusy(false); } }
 async function send(id: string, method: "contribute" | "claimRefund") { if (!ref.current.connected) { notify("Devam etmek için MetaMask cüzdanını bağlayın."); return; } const [serviceId, slotIndex] = id.split("-").map(Number); setBusy(true); try {
  const signer = await provider().getSigner(); const live = contract(signer); const tx = method === "contribute" ? await live.contribute(serviceId, { value: parseEther("1") }) : await live.claimRefund(serviceId, slotIndex); notify("İşlem zincire gönderildi. Monad onayı bekleniyor…"); const receipt = await tx.wait(); if (!receipt?.status) throw new Error("Zincir işlemi başarısız oldu.");
  const activity: Activity = { id: tx.hash, service: services[serviceId], slot: `Slot 0${slotIndex + 1}`, kind: method === "contribute" ? "support" : "refund", amount: 1, time: new Date().toLocaleTimeString() }; commit({ ...ref.current, history: [activity, ...ref.current.history] }); await refresh(); notify(method === "contribute" ? "1 MON başarıyla taahhüt edildi." : "1 MON iadesi cüzdanınıza gönderildi.");
 } catch (error) { notify(readableError(error)); } finally { setBusy(false); } }
 async function finalize(serviceId: number) { if (!ref.current.connected) { notify("Süre dolan slotu kapatmak için MetaMask cüzdanını bağlayın."); return; } setBusy(true); try { const tx = await contract(await provider().getSigner()).finalizeExpired(serviceId); notify("Slot kapanışı zincire gönderildi…"); await tx.wait(); await refresh(); notify("Süresi dolan slot zincirde kapatıldı. Destekçiler iade alabilir."); } catch (error) { notify(readableError(error)); } finally { setBusy(false); } }
 return <Context.Provider value={{ state, now, busy, toast, notify, connect, select: (active) => commit({ ...ref.current, active }), support: (id) => send(id, "contribute"), refund: (id) => send(id, "claimRefund"), finalize, refresh }}>{children}</Context.Provider>;
}
export function useApp() { const context = useContext(Context); if (!context) throw Error("AppProvider missing"); return context; }
