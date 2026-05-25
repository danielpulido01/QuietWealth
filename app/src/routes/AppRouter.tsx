<GuestGuard>
  <LoginPage />
</GuestGuard>

<AuthGuard>
  <DashboardLayout>
    <HomePage />
  </DashboardLayout>
</AuthGuard>

<AuthGuard>
  <PolicyGuard required={["dua.generate"]}>
    <ConfigureGeneratorPage />
  </PolicyGuard>
</AuthGuard>