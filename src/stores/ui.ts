import { create } from "zustand";

interface UIState {
  // Modal states
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  toggleModal: () => void;

  // Sidebar states
  isSidebarOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;

  // Loading states
  isLoading: boolean;
  setLoading: (loading: boolean) => void;

  // Generic toggle state
  toggles: Record<string, boolean>;
  setToggle: (key: string, value: boolean) => void;
  getToggle: (key: string) => boolean;
  toggle: (key: string) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  // Modal
  isModalOpen: false,
  openModal: () => set({ isModalOpen: true }),
  closeModal: () => set({ isModalOpen: false }),
  toggleModal: () => set((state) => ({ isModalOpen: !state.isModalOpen })),

  // Sidebar
  isSidebarOpen: false,
  openSidebar: () => set({ isSidebarOpen: true }),
  closeSidebar: () => set({ isSidebarOpen: false }),
  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

  // Loading
  isLoading: false,
  setLoading: (loading) => set({ isLoading: loading }),

  // Generic toggles
  toggles: {},
  setToggle: (key, value) =>
    set((state) => ({
      toggles: { ...state.toggles, [key]: value },
    })),
  getToggle: (key) => get().toggles[key] ?? false,
  toggle: (key) =>
    set((state) => ({
      toggles: { ...state.toggles, [key]: !state.toggles[key] },
    })),
}));
