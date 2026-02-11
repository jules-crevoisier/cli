export function validateProjectName(input: string): string | true {
  if (!input || input.trim().length === 0) {
    return 'Project name is required';
  }
  if (!/^[a-z0-9][a-z0-9._-]*$/.test(input)) {
    return 'Project name must start with a lowercase letter or number and contain only lowercase letters, numbers, hyphens, dots, or underscores';
  }
  if (input.length > 214) {
    return 'Project name must be 214 characters or fewer';
  }
  return true;
}
