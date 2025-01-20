"use client";

import { api } from "@/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { AddCertificateCard } from "./AddCertificateCard";
import { CertificateCard } from "./CertificateCard";
import { Id } from "@/convex/_generated/dataModel";

interface Certificate {
  id: Id<"certificates">;
  title: string;
  category: string;
  description: string;
  image: string | null | undefined;
  order: number;
}

export function CertificateGrid() {
  const { user, isLoaded } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress;

  // First get user data from email
  const userData = useQuery(
    api.users.getUser,
    email ? { email } : "skip"
  );

  // Then use the username to get certificates
  const certificates = useQuery(
    api.certificates.get,
    userData?.username ? { username: userData.username } : "skip"
  );

  const removeCertificate = useMutation(api.certificates.remove);

  const handleDelete = async (certificateId: Id<"certificates">) => {
    try {
      await removeCertificate({ certificateId });
    } catch (error) {
      console.error("Failed to delete certificate:", error);
    }
  };

  // Show loading state while user data is loading
  if (!isLoaded || !userData || certificates === undefined) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 mt-12">
        {[...Array(1)].map((_, i) => (
          <CertificateCard
            key={i}
            title=""
            category=""
            description=""
            isLoading={true}
          />
        ))}
      </div>
    );
  }

  // Show message if no user is logged in
  if (!email) {
    return (
      <div className="mt-12 text-center text-gray-500">
        Please log in to view certificates
      </div>
    );
  }

  // Show message if no certificates found
  if (certificates.length === 0) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 mt-12">
        <AddCertificateCard />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 mt-12">
      {certificates.map((certificate: Certificate) => (
        <CertificateCard
          key={certificate.id}
          id={certificate.id}
          title={certificate.title}
          category={certificate.category}
          description={certificate.description}
          image={certificate.image}
          onDelete={handleDelete}
        />
      ))}
      <AddCertificateCard />
    </div>
  );
} 