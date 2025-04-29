"use client";

import { api } from "@/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { AddCertificateCard } from "./AddCertificateCard";
import { CertificateCard } from "./CertificateCard";
import { Id } from "@/convex/_generated/dataModel";
import { Title } from "../ui/Title";
import { useMemo } from "react";
import { CertificateCardSkeleton } from "../platform-stats/LoadingSkeleton";

interface Certificate {
  id: Id<"certificates">;
  title: string;
  category: string;
  description: string;
  image: string | null | undefined;
  order: number;
}

interface CertificateGridProps {
  username?: string;
  isPublicView?: boolean;
}

export function CertificateGrid({ username, isPublicView = false }: CertificateGridProps) {
  const { user, isLoaded } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress;

  const privateUserData = useQuery(
    api.users.getUser,
    !isPublicView && email ? { email } : "skip"
  );

  const certificates = useQuery(
    api.certificates.get,
    isPublicView 
      ? username ? { username } : "skip"
      : privateUserData?.username ? { username: privateUserData.username } : "skip"
  );

  // Ensure certificates are sorted by order
  const sortedCertificates = useMemo(() => {
    if (!certificates) return undefined;
    return [...certificates].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [certificates]);

  const removeCertificate = useMutation(api.certificates.remove);
  const reorderCertificates = useMutation(api.certificates.reorder);

  const handleDelete = async (certificateId: Id<"certificates">) => {
    try {
      await removeCertificate({ certificateId });
    } catch (error) {
      console.error("Failed to delete certificate:", error);
    }
  };

  const handleReorder = async (fromIndex: number, toIndex: number) => {
    if (!email || !certificates || !privateUserData?.username) return;

    const newCertificates = [...certificates];
    const [movedItem] = newCertificates.splice(fromIndex, 1);
    newCertificates.splice(toIndex, 0, movedItem);

    const updates = newCertificates.map((cert, i) => ({
      certificateId: cert.id,
      order: i,
    }));

    await reorderCertificates({
      email,
      updates,
    });
  };

  if ((!isLoaded && !isPublicView) || (!isPublicView && !privateUserData) || !sortedCertificates) {
    return (
      <>
      <Title title="Certificates" />
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 mt-2">
          {[...Array(4)].map((_, i) => (
            <CertificateCardSkeleton key={i} />
          ))}
        </div>
      </>
    );
  }

  if (!isPublicView && !email) {
    return (
      <>
      <Title title="Certificates" />
        <div className="text-center text-gray-500 mt-2">
          Please log in to view certificates
        </div>
      </>
    );
  }

  if (!sortedCertificates || sortedCertificates.length === 0) {
    if (isPublicView) {
      return null;
    }
    return (
      <>
      <Title title="Certificates" />
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 mt-2">
          <AddCertificateCard />
        </div>
      </>
    );
  }

  return (
    <>
    <Title title="Certificates" />
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 mt-2">
        {sortedCertificates.map((certificate: Certificate, index) => (
          <CertificateCard
            key={certificate.id}
            id={certificate.id}
            title={certificate.title}
            category={certificate.category}
            description={certificate.description}
            image={certificate.image}
            index={index}
            onReorder={!isPublicView ? handleReorder : undefined}
            onDelete={!isPublicView ? () => handleDelete(certificate.id) : undefined}
            isPublicView={isPublicView}
          />
        ))}
        {!isPublicView && <AddCertificateCard />}
      </div>
    </>
  );
} 