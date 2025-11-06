import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import treeMaker from "@roumi/treemaker";
import "../tree_maker.css";

import { fetchOrgData } from "../services/orgService";
import type { Person } from "../services/orgService";
import { buildTreeMakerData } from "../utils/treeMakerMapper";

export default function OrgTree() {
  const navigate = useNavigate();
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const listenersRef = useRef<Array<() => void>>([]);

  useEffect(() => {
    let isMounted = true;

    fetchOrgData().then((root) => {
      if (!isMounted) return;
      const { tree, treeParams } = buildTreeMakerData(root);

      Object.assign(treeParams, {
        card_width: 120,
        card_height: 70,
        level_spacing: 90,
        sibling_spacing: 40,
      });

      const container = document.getElementById("org-tree-container");
      if (container) container.innerHTML = "";

      treeMaker(tree, {
        id: "org-tree-container",
        treeParams,
        clickable: true,
        card_click: (el: any) => {
          const maybeId =
            (typeof el === "object" && el !== null && (el.id || el.ID || el.key)) ||
            null;
          if (maybeId && treeParams[maybeId]) {
            setSelectedPerson(treeParams[maybeId].person);
          }
        },
        link_width: "3px",
        link_color: "#0d6efd",
      });

      setTimeout(() => {
        const nodes = Array.from(
          document.querySelectorAll<HTMLElement>(".tree__container__step__card")
        );

        if (nodes.length === 0) {
          const alt = Array.from(document.querySelectorAll<HTMLElement>("[id]"));
          const filtered = alt.filter((el) => {
            const id = el.id;
            if (!id) return false;
            return (
              id === "tree__container__step__card__first" ||
              /^\d+$/.test(id) ||
              /^node-/.test(id)
            );
          });
          filtered.forEach((n) => nodes.push(n));
        }

        nodes.forEach((node) => {
          const handler = () => {
            const id =
              node.id ||
              node.getAttribute("data-id") ||
              node.getAttribute("data-node-id") ||
              node.getAttribute("data-key") ||
              node.dataset?.id ||
              node.dataset?.nodeId ||
              null;

            let person: Person | undefined;

            if (id && (treeParams as any)[id]) {
              person = (treeParams as any)[id].person;
            } else if (!id) {
              const text = node.innerText?.trim();
              if (text) {
                for (const k of Object.keys(treeParams)) {
                  const t = (treeParams as any)[k].trad;
                  if (t && String(t).includes(text.split("\n")[0])) {
                    person = (treeParams as any)[k].person;
                    break;
                  }
                }
              }
            }

            if (person) {
              setSelectedPerson(person);
            } else {
              console.warn("Clicked node but could not resolve person id. node:", node);
            }
          };

          node.style.pointerEvents = "auto";
          node.style.cursor = "pointer";
          node.addEventListener("click", handler);

          listenersRef.current.push(() => node.removeEventListener("click", handler));
        });

        console.log("Attached click listeners to nodes:", nodes.map((n) => n.id));
      }, 50);
    });

    return () => {
      isMounted = false;
      listenersRef.current.forEach((fn) => fn());
      listenersRef.current = [];
    };
  }, []);

  return (
    <div style={{ padding: "50px" }}>
      <h1>Company Org Tree</h1>

      <div style={{ display: "flex", gap: "40px", alignItems: "flex-start" }}>
        <div
          style={{
            flex: 2,
            maxWidth: "100%",
            overflowX: "auto",
            overflowY: "hidden",
            paddingBottom: "15px",
            border: "1px solid #ddd",
            position: "relative",
          }}
        >
          <div id="org-tree-container" />
        </div>

        <div
          style={{
            flex: 1,
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "20px",
            background: "#fafafa",
          }}
        >
          <h3>Person Details</h3>
          {selectedPerson ? (
            <>
              <p>
                <strong>Name:</strong> {selectedPerson.name}
              </p>
              <p>
                <strong>Title:</strong> {selectedPerson.title}
              </p>
              <button
                onClick={() => navigate(`/person/${selectedPerson.id}`)}
                style={{
                  marginTop: "10px",
                  padding: "8px 16px",
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                View Full Profile
              </button>
            </>
          ) : (
            <p>Select a person to view details.</p>
          )}
        </div>
      </div>

      <button
        onClick={() => navigate("/dashboard")}
        style={{
          marginTop: "40px",
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        Back to Dashboard
      </button>
    </div>
  );
}
