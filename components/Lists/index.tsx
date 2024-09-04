import { TableList, columns } from "./columns";
import { DataTable } from "./data-table";

const data: TableList[] = [
  {
    id: "728ed5d2f",
    list: "List 1",
    status: "finished",
    email: "m1@example.com",
    createdAt: "2021-01-01",
  },
  {
    id: "72s8ed52f",
    list: "List 2",
    status: "processing",
    email: "m2@example.com",
    createdAt: "2021-01-02",
  },
  {
    id: "728ded52f",
    list: "List 3",
    status: "finished",
    email: "m3@example.com",
    createdAt: "2021-01-03",
  },
  {
    id: "728ed52ff",
    list: "List 4",
    status: "failed",
    email: "m4@example.com",
    createdAt: "2021-01-04",
  },
  {
    id: "728ecd52f",
    list: "List 5",
    status: "queued",
    email: "m5@example.com",
    createdAt: "2021-01-05",
  },
];

export default function Lists() {
  return (
    <div className="pt-6">
      <DataTable columns={columns} data={data} />
    </div>
  );
}
