"use client";

import { api } from "@/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { AddCertificateCard } from "./AddCertificateCard";
import { CertificateCard } from "./CertificateCard";
import { Id } from "@/convex/_generated/dataModel";
import { Title } from "../ui/Title";

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

  // First get user data from email (for private view)
  const privateUserData = useQuery(
    api.users.getUser,
    !isPublicView && email ? { email } : "skip"
  );

  // Get certificates either from username (public) or user data (private)
  const certificates = useQuery(
    api.certificates.get,
    isPublicView 
      ? username ? { username } : "skip"
      : privateUserData?.username ? { username: privateUserData.username } : "skip"
  );

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

    // Create updates array with new order
    const newCertificates = [...certificates];
    const [movedItem] = newCertificates.splice(fromIndex, 1);
    newCertificates.splice(toIndex, 0, movedItem);

    // Update order in database
    const updates = newCertificates.map((cert, i) => ({
      certificateId: cert.id,
      order: i,
    }));

    await reorderCertificates({
      email,
      updates,
    });
  };

  // Show loading state while data is loading
  if ((!isLoaded && !isPublicView) || (!isPublicView && !privateUserData) || certificates === undefined) {
    return (
      <>
        <Title title="Certificates" />
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 mt-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm animate-pulse">
              {/* Image placeholder */}
              <div className="aspect-video p-4 pb-1">
                <div className="w-full h-full bg-gray-200 rounded-lg" />
              </div>
              
              {/* Content */}
              <div className="p-4 pt-0">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-3" />
                <div className="h-5 bg-gray-200 rounded w-1/4 mb-3" />
                <div className="h-4 bg-gray-200 rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

  // Show message if no certificates found
  if (!certificates || certificates.length === 0) {
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
        {certificates.map((certificate: Certificate, index) => (
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