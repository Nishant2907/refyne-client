import { create } from "zustand";

interface useCsvFileProps {
  noOfColums: number;
  setNoOfColumns: (noOfColums: number) => void;
  noOfRows: number;
  setNoOfRows: (noOfRows: number) => void;
}

export const useCsvFile = create<useCsvFileProps>((set) => ({
  noOfColums: 0,
  setNoOfColumns: (noOfColums: number) => set({ noOfColums }),
  noOfRows: 0,
  setNoOfRows: (noOfRows: number) => set({ noOfRows }),
}));
