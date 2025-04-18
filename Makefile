gt:
	@if [ -z "$(message)" ]; then echo "Please provide a commit message using 'make gt message=\"your_message_here\"'"; exit 1; fi
	git add .
	git commit -m "$(message)"
	git push origin HEAD
#Example:
#make gt message="feature: Add new feature"