export type SlotStatus = "Locked" | "Active" | "Successful" | "Failed";
export type Service = { id: number; name: string; description: string; deadline: string; slots: { label: string; status: SlotStatus; supporters: number }[] };

export const services: Service[] = [
  { id: 0, name: "Library", description: "Give focused study time a little more room.", deadline: "Demo campaign deadline — awaiting contract data", slots: [{ label: "00:00–00:30", status: "Active", supporters: 1 }, { label: "00:30–01:00", status: "Locked", supporters: 0 }, { label: "01:00–01:30", status: "Locked", supporters: 0 }] },
  { id: 1, name: "Laundry Room", description: "Make late laundry plans work for more students.", deadline: "Demo campaign deadline — awaiting contract data", slots: [{ label: "23:00–23:30", status: "Active", supporters: 0 }, { label: "23:30–00:00", status: "Locked", supporters: 0 }, { label: "00:00–00:30", status: "Locked", supporters: 0 }] },
  { id: 2, name: "Cafeteria", description: "Help the campus dinner window stretch later.", deadline: "Demo campaign deadline — awaiting contract data", slots: [{ label: "20:00–20:30", status: "Active", supporters: 0 }, { label: "20:30–21:00", status: "Locked", supporters: 0 }, { label: "21:00–21:30", status: "Locked", supporters: 0 }] }
];
