from disruption_engine import analyze_conditions

result = analyze_conditions(rainfall_mm_per_hr=55, aqi=150)
# DisruptionResult(disruptionDetected=True, disruptionType='Heavy Rain',
#                  severityScore=1.0, triggerPayout=True)
