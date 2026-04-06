import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import {
  type EmployeeRecord,
  fetchEmployeeById,
} from "../services/orgService";

type TriggerVariant = "inline" | "block";

interface EmployeePreviewTriggerProps {
  employeeId: number;
  onNavigate: () => void;
  children: ReactNode;
  className?: string;
  variant?: TriggerVariant;
  ariaLabel?: string;
}

const CLOSE_DELAY_MS = 120;
const PREVIEW_WIDTH = 300;
const EDGE_PADDING = 12;

const inMemoryPreviewCache = new Map<number, EmployeeRecord | null>();

function getPreviewPosition(anchorRect: DOMRect): CSSProperties {
  const canOpenBelow =
    anchorRect.bottom + 16 + 220 < window.innerHeight - EDGE_PADDING;
  const top = canOpenBelow
    ? anchorRect.bottom + 8
    : Math.max(EDGE_PADDING, anchorRect.top - 220 - 8);

  let left = anchorRect.left;
  if (left + PREVIEW_WIDTH > window.innerWidth - EDGE_PADDING) {
    left = window.innerWidth - PREVIEW_WIDTH - EDGE_PADDING;
  }

  return {
    position: "fixed",
    top,
    left: Math.max(EDGE_PADDING, left),
    width: PREVIEW_WIDTH,
    zIndex: 9999,
  };
}

function EmployeePreviewCard({
  isLoading,
  employee,
  error,
  cardId,
  position,
  onNavigate,
  onMouseEnter,
  onMouseLeave,
}: {
  isLoading: boolean;
  employee: EmployeeRecord | null;
  error: string | null;
  cardId: string;
  position: CSSProperties;
  onNavigate: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  return (
    <div
      id={cardId}
      role="button"
      tabIndex={0}
      className="employee-preview"
      style={position}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onNavigate}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onNavigate();
        }
      }}
      aria-label="Open employee profile"
    >
      {isLoading && <div className="employee-preview__state">Loading preview...</div>}

      {!isLoading && error && <div className="employee-preview__state">{error}</div>}

      {!isLoading && !error && employee && (
        <>
          <div className="employee-preview__header">
            {employee.Picture ? (
              <img
                src={employee.Picture}
                alt={`${employee.FirstName} ${employee.LastName}`}
                className="employee-preview__avatar"
              />
            ) : (
              <div className="employee-preview__avatar-placeholder" aria-hidden="true">
                {employee.FirstName?.[0]}
                {employee.LastName?.[0]}
              </div>
            )}
            <div>
              <div className="employee-preview__name">
                {employee.FirstName} {employee.LastName}
              </div>
              <div className="employee-preview__title">{employee.Title || "No title"}</div>
            </div>
          </div>

          <div className="employee-preview__meta">
            <div>
              <span className="employee-preview__label">Department:</span>{" "}
              {employee.DepartmentName || "Unknown"}
            </div>
            <div>
              <span className="employee-preview__label">Email:</span>{" "}
              {employee.EmailAddress || "Not available"}
            </div>
            <div>
              <span className="employee-preview__label">Phone:</span>{" "}
              {employee.PhoneNumber || "Not available"}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function EmployeePreviewTrigger({
  employeeId,
  onNavigate,
  children,
  className,
  variant = "inline",
  ariaLabel,
}: EmployeePreviewTriggerProps) {
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const closeTimerRef = useRef<number | null>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [employee, setEmployee] = useState<EmployeeRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [position, setPosition] = useState<CSSProperties>({});

  const cardId = useId();

  const clearTimers = () => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const updatePosition = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPosition(getPreviewPosition(rect));
  };

  const openPreview = () => {
    clearTimers();
    updatePosition();
    setIsOpen(true);
  };

  const closePreview = () => {
    clearTimers();
    closeTimerRef.current = window.setTimeout(() => {
      setIsOpen(false);
    }, CLOSE_DELAY_MS);
  };

  useEffect(() => {
    if (!isOpen) return;

    const maybeCached = inMemoryPreviewCache.get(employeeId);
    if (maybeCached !== undefined) {
      setEmployee(maybeCached);
      setError(maybeCached ? null : "Employee details unavailable");
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetchEmployeeById(employeeId)
      .then((value) => {
        if (cancelled) return;
        inMemoryPreviewCache.set(employeeId, value);
        setEmployee(value);
        if (!value) setError("Employee details unavailable");
      })
      .catch(() => {
        if (cancelled) return;
        inMemoryPreviewCache.set(employeeId, null);
        setError("Failed to load preview");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [employeeId, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.blur();
      }
    };

    const onReposition = () => updatePosition();

    window.addEventListener("keydown", onEscape);
    window.addEventListener("scroll", onReposition, true);
    window.addEventListener("resize", onReposition);

    return () => {
      window.removeEventListener("keydown", onEscape);
      window.removeEventListener("scroll", onReposition, true);
      window.removeEventListener("resize", onReposition);
    };
  }, [isOpen]);

  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, []);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={`employee-preview-trigger employee-preview-trigger--${variant}${className ? ` ${className}` : ""}`}
        onPointerEnter={openPreview}
        onPointerLeave={closePreview}
        onMouseEnter={openPreview}
        onMouseLeave={closePreview}
        onFocus={openPreview}
        onBlur={closePreview}
        onClick={onNavigate}
        aria-label={ariaLabel}
        aria-describedby={isOpen ? cardId : undefined}
        aria-expanded={isOpen}
      >
        {children}
      </button>

      {isOpen &&
        createPortal(
          <EmployeePreviewCard
            isLoading={isLoading}
            employee={employee}
            error={error}
            cardId={cardId}
            position={position}
            onNavigate={onNavigate}
            onMouseEnter={openPreview}
            onMouseLeave={closePreview}
          />,
          document.body
        )}
    </>
  );
}