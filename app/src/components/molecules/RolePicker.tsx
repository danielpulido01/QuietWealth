import { Button } from "../atoms/Button";
import type { UserRole } from "../../models/local-mvp";
import { useTranslation } from "react-i18next";

const ROLE_OPTIONS: UserRole[] = ["Investor", "SME", "Expert"];

type RolePickerProps = {
  selectedRole: UserRole;
  onSelect: (role: UserRole) => void;
};

export function RolePicker({ selectedRole, onSelect }: RolePickerProps) {
  const { t } = useTranslation();

  return (
    <div className="role-picker" role="tablist" aria-label={t("login.role.label")}>
      {ROLE_OPTIONS.map((role) => (
        <Button
          key={role}
          variant={selectedRole === role ? "success" : "ghost"}
          className="role-picker__button"
          aria-pressed={selectedRole === role}
          onClick={() => onSelect(role)}
        >
          <span className="role-picker__title">{t(`roles.${role}.label`)}</span>
          <span className="role-picker__description">{t(`roles.${role}.summary`)}</span>
        </Button>
      ))}
    </div>
  );
}
