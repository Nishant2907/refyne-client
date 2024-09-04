import {
  Link,
  LucideGripVertical,
  MousePointerClick,
  MoveLeft,
  Newspaper,
  RadioTower,
  TrendingUp,
  User,
} from "lucide-react";
import Image from "next/image";
import Papa from "papaparse";
import { useCallback, useEffect, useState } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import toast from "react-hot-toast";

import {
  UserSubscription,
  checkUserSubscription,
} from "@/actions/checkUserSubscription";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  closeDialog,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { MAX_FREE_CREDITS } from "@/constants";
import useAuthModal from "@/hooks/useAuthModal";
import { useUser } from "@/hooks/useUser";
import { cn } from "@/lib/utils";
import { useCsvFile } from "@/hooks/useCsvFile";

const initialItems = [
  {
    id: "1",
    icon: TrendingUp,
    title: "Case Studies",
    description: "Find case studies featured on the prospects website",
  },
  {
    id: "2",
    icon: RadioTower,
    title: "Personal Content",
    description: "Find media appearances featuring your prospect",
  },
  {
    id: "3",
    icon: MousePointerClick,
    title: "Company Website",
    description: "Use data from your prospects company website as input",
  },
  {
    id: "4",
    icon: Newspaper,
    title: "Recent News",
    description: "Find news articles mentioning your prospects company",
  },
  {
    id: "5",
    icon: User,
    title: "No-Touch LinkedIn",
    description: "Use your prospects LinkedIn profile as input",
  },
];

export default function AI() {
  const [csvFile, setCsvFile] = useState<File | null>();
  const [isCompanyWebsite, setIsCompanyWebsite] = useState(false);
  const [isCaseStudies, setIsCaseStudies] = useState(false);
  const [isPersonalContent, setIsPersonalContent] = useState(false);
  const [isNoTouchLinkedin, setIsNoTouchLinkedin] = useState(false);
  const [isRecentNews, setIsRecentNews] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [items, setItems] = useState(initialItems);
  const [csvFileColums, setCsvFileColums] = useState<string[]>();
  const [jsonRes, setJsonRes] = useState<UserSubscription>();

  const { user } = useUser();
  const authModal = useAuthModal();
  const rowsAndCols = useCsvFile();

  useEffect(() => {
    if (!user && !authModal.isAuthModalOpen) authModal.openAuthModal();
    if (user && authModal.isAuthModalOpen) authModal.closeAuthModal();
  }, [authModal, user]);

  const checking = useCallback(async () => {
    if (!user) return;
    let res = await checkUserSubscription(user?.id);
    setJsonRes(res);
  }, [user]);

  useEffect(() => {
    checking();
  }, [user, checking]);

  const onDragEnd = (result: { destination: any; source?: any }) => {
    if (!result.destination) return;
    const { source, destination } = result;
    const newItems = [...items];
    const [removed] = newItems.splice(source.index, 1);
    newItems.splice(destination.index, 0, removed);
    setItems(newItems);
  };

  const handleParse = (csvFile: File) => {
    if (!csvFile) {
      console.log("Enter a valid csv file");
      return toast.error("Enter a valid csv file");
    }
    const reader = new FileReader();

    reader.onload = async ({ target }) => {
      if (target?.result !== undefined && typeof target?.result === "string") {
        const csv = Papa.parse(target?.result, { header: true });
        const parsedData = csv?.data;
        const columns = Object.keys(parsedData[0] || {});
        const rows = parsedData.length;
        setCsvFileColums(columns);

        rowsAndCols.setNoOfRows(rows);
        rowsAndCols.setNoOfColumns(columns.length);
      }
    };
    reader.readAsText(csvFile);
  };

  const onScan = async () => {
    if (!user) return toast.error("Please login to continue");

    if (jsonRes?.isSubscribed) {
      if (rowsAndCols.noOfRows > jsonRes?.credits) {
        toast.error("Your file exceeds the free credits limit");
      }
    } else {
      if (rowsAndCols.noOfRows > MAX_FREE_CREDITS) {
        toast.error("Your file exceeds the free credits limit");
      }
    }

    const res = await fetch("/api/increase", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: user.id,
        amount: rowsAndCols.noOfRows,
        totalCredits: jsonRes && jsonRes.credits ? jsonRes.credits : 0,
      }),
    });

    if (res.status === 400) {
      toast.error("You have exceeded the free credits");
    }
    if (res.ok) {
      toast.success("Scanned");
      closeDialog();
    }
  };

  return (
    <DashboardLayout>
      <div className="w-full h-full flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-2 text_gradient">
          Create AI First Lines
        </h1>
        <p className="text-center">
          Use ChatGPT to create cold outreach personalization at scale
        </p>
        <div className="my-6 bg-accent dark:bg-accent/30 rounded-md">
          <Image
            src="/upload.png"
            alt="AI"
            width={55}
            height={55}
            className="ml-4 my-4 mr-3"
          />
        </div>
        <Label
          tabIndex={0}
          htmlFor="csv_input"
          className="offset_ring bg-accent w-[200px] px-4 truncate text-center py-2 dark:bg-accent/30 text-foreground border-2 rounded-xl hover:opacity-80 hover:bg-accent cursor-pointer"
        >
          {csvFile ? csvFile?.name : "click to upload a .csv file"}
        </Label>
        <input
          id="csv_input"
          type="file"
          accept="
          .csv,
          application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,
          application/vnd.ms-excel"
          className="hidden"
          onChange={(e) => {
            const file = e.currentTarget.files?.[0];
            setCsvFile(file);
            file && handleParse(file);
          }}
          onClick={(e) => (e.currentTarget.value = "")}
        />

        <Dialog
          open={csvFile ? true : false}
          onOpenChange={
            csvFile
              ? (isOpen) => {
                  if (!isOpen) {
                    setCsvFile(null);
                    setCsvFileColums(undefined);
                    setCurrentStep(1);
                  }
                }
              : undefined
          }
        >
          <DialogTrigger className="" id="trigger_dialog"></DialogTrigger>
          <DialogContent className="sm:max-w-3xl" hideCloseIcon={true}>
            {currentStep === 1 && (
              <>
                <DialogHeader className="text-start">
                  <DialogTitle className="text-xl">Start a scrape</DialogTitle>
                  <DialogDescription>
                    Choose the data sources you&apos;re interested in
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="flex items-center gap-4 border-b pb-4 pt-2">
                    <TrendingUp className="mt-1 self-start text-gray-500" />
                    <div>
                      <div className="text-sm font-medium">Case Studies</div>
                      <div className="text-xs font-normal">
                        Find case studies featured on the prospects website
                      </div>
                    </div>
                    <div className="flex-grow"></div>
                    <div>
                      <Switch
                        checked={isCaseStudies}
                        onCheckedChange={setIsCaseStudies}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-4 border-b pb-4 pt-2">
                    <RadioTower className="mt-1 self-start text-gray-500" />
                    <div>
                      <div className="text-sm font-medium">
                        Personal Content
                      </div>
                      <div className="text-xs font-normal">
                        Find media appearances featuring your prospect
                      </div>
                    </div>
                    <div className="flex-grow"></div>
                    <div>
                      <Switch
                        checked={isPersonalContent}
                        onCheckedChange={setIsPersonalContent}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-4 border-b pb-4 pt-2">
                    <MousePointerClick className="mt-1 self-start text-gray-500" />
                    <div>
                      <div className="text-sm font-medium">Company Website</div>
                      <div className="text-xs font-normal">
                        Use data from your prospects company website as input
                      </div>
                    </div>
                    <div className="flex-grow"></div>
                    <div>
                      <Switch
                        checked={isCompanyWebsite}
                        onCheckedChange={setIsCompanyWebsite}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-4 border-b pb-4 pt-2">
                    <Newspaper className="mt-1 self-start text-gray-500" />
                    <div>
                      <div className="text-sm font-medium">Recent News</div>
                      <div className="text-xs font-normal">
                        Find news articles mentioning your prospects company
                      </div>
                    </div>
                    <div className="flex-grow"></div>
                    <div>
                      <Switch
                        checked={isRecentNews}
                        onCheckedChange={setIsRecentNews}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-4 border-b pb-4 pt-2">
                    <User className="mt-1 self-start text-gray-500" />
                    <div>
                      <div className="text-sm font-medium">
                        No-Touch LinkedIn
                      </div>
                      <div className="text-xs font-normal">
                        Use your prospects LinkedIn profile as input
                      </div>
                    </div>
                    <div className="flex-grow"></div>
                    <div>
                      <Switch
                        checked={isNoTouchLinkedin}
                        onCheckedChange={setIsNoTouchLinkedin}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={() => setCurrentStep(currentStep + 1)}>
                    Continue
                  </Button>
                </DialogFooter>
              </>
            )}
            {currentStep === 2 && (
              <DialogContent className="sm:max-w-3xl" hideCloseIcon={true}>
                <DialogHeader className="relative text-start">
                  <DialogTitle className="text-xl">
                    Choose your order
                  </DialogTitle>
                  <DialogDescription>
                    Drag & drop your sources to rank them in terms of importance
                  </DialogDescription>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute -right-2 -top-2 flex items-center gap-2"
                    onClick={() => setCurrentStep(currentStep - 1)}
                  >
                    <MoveLeft />
                    back
                  </Button>
                </DialogHeader>

                <DragDropContext onDragEnd={onDragEnd}>
                  <Droppable droppableId="items">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="grid gap-4 py-4"
                      >
                        {items.map(
                          ({ id, icon: Icon, title, description }, index) => (
                            <Draggable key={id} draggableId={id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={cn(
                                    "flex items-center justify-between gap-4 border-b pb-4 pt-2 rounded-lg",
                                    {
                                      "!bg-accent": snapshot.isDragging,
                                    }
                                  )}
                                  style={{
                                    ...provided.draggableProps.style,
                                    left: "1.5rem",
                                  }}
                                >
                                  <div className="flex items-center gap-4">
                                    <Icon className="mt-1 self-start text-gray-500" />
                                    <p className="flex flex-col items-start">
                                      <div className="text-sm font-medium">
                                        {title}
                                      </div>
                                      <div className="text-xs font-normal">
                                        {description}
                                      </div>
                                    </p>
                                  </div>
                                  <div className="hover:bg-accent cursor-grab rounded-md p-2 self-end">
                                    <LucideGripVertical />
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          )
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>

                <DialogFooter>
                  <Button onClick={() => setCurrentStep(currentStep + 1)}>
                    Continue
                  </Button>
                </DialogFooter>
              </DialogContent>
            )}
            {currentStep === 3 && (
              <>
                <DialogHeader className="relative text-start">
                  <DialogTitle className="text-xl">Map your fields</DialogTitle>
                  <DialogDescription>
                    Tell us where we can find your data
                  </DialogDescription>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute right-1 top-0 flex items-center gap-2"
                    onClick={() => setCurrentStep(currentStep - 1)}
                  >
                    <MoveLeft />
                    back
                  </Button>
                </DialogHeader>

                <div className="sm:px-4 overflow-y-auto max-h-96">
                  <p className="text-xl font-semibold my-8">Map fields</p>
                  <div className="flex flex-col gap-y-4 pb-2">
                    {csvFileColums?.map((column: string, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between"
                      >
                        <p className="flex items-center gap-4 truncate">
                          <Link size={18} />
                          {column}
                        </p>
                        <Select defaultValue="donotimport">
                          <SelectTrigger className="w-[8.5rem] sm:w-64">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <ScrollArea className="h-72">
                                <SelectItem value="donotimport">
                                  Do not import
                                </SelectItem>
                                <SelectItem value="first_name">
                                  First Name
                                </SelectItem>
                                <SelectItem value="last_name">
                                  Last Name
                                </SelectItem>
                                <SelectItem value="email">Email</SelectItem>
                                <SelectItem value="job_title">
                                  Job Title
                                </SelectItem>
                                <SelectItem value="company_name">
                                  Company Name
                                </SelectItem>
                                <SelectItem value="website">Website</SelectItem>
                                <SelectItem value="personal_linkedin_url">
                                  Personal Linkedin url
                                </SelectItem>
                                <SelectItem value="company_linkedin_url">
                                  Company Linkedin url
                                </SelectItem>
                                <SelectItem value="profile_image_url">
                                  Profile Image Url
                                </SelectItem>
                                <SelectItem value="first_phone">
                                  First Phone
                                </SelectItem>
                                <SelectItem value="mobile_phone">
                                  Mobile Phone
                                </SelectItem>
                                <SelectItem value="corporate_phone">
                                  Corporate Phone
                                </SelectItem>
                                <SelectItem value="hashtag_employees">
                                  # Employees
                                </SelectItem>
                                <SelectItem value="industry">
                                  Industry
                                </SelectItem>
                                <SelectItem value="facebook_url">
                                  Facebook url
                                </SelectItem>
                                <SelectItem value="twitter_url">
                                  Twitter url
                                </SelectItem>
                                <SelectItem value="city">City</SelectItem>
                                <SelectItem value="state">State</SelectItem>
                                <SelectItem value="country">Country</SelectItem>
                                <SelectItem value="contact_id">
                                  Contact ID
                                </SelectItem>
                                <SelectItem value="account_id">
                                  Account ID
                                </SelectItem>
                              </ScrollArea>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                </div>

                <DialogFooter>
                  <Button onClick={onScan}>Start Scan</Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
