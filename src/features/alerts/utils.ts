// Utilities for the alerts feature

export function formatAlertMessage(
  childName: string,
  topicTitle: string,
  subsectionTitle: string
): string {
  return `${childName} is stuck on "${subsectionTitle}" in ${topicTitle}.`;
}
