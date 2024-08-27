import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { toast } from './ui/use-toast';

interface SurveyProps {
  surveyId: number;
  questions: any[];
}

export function Survey({ surveyId, questions }: SurveyProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [canContact, setCanContact] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAnswer = (questionId: string, answer: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('survey_responses')
        .insert({ survey_id: surveyId, answers, email, name, can_contact: canContact });

      if (error) throw error;
      toast({
        title: 'Success',
        description: 'Survey submitted successfully!',
      });
      window.location.href = '/';
    } catch (error) {
      console.error('Error submitting survey:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit survey. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentQ = questions[currentQuestion];

  const renderQuestion = () => {
    switch (currentQ.type) {
      case 'text':
        return (
          <Input
            type="text"
            onChange={(e) => handleAnswer(currentQ.id, e.target.value)}
            value={answers[currentQ.id] as string || ''}
          />
        );
      case 'yesno':
      case 'truefalse':
        return (
          <RadioGroup
            onValueChange={(value) => handleAnswer(currentQ.id, value)}
            value={answers[currentQ.id] as string}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="yes" />
              <label htmlFor="yes">{currentQ.type === 'yesno' ? 'Yes' : 'True'}</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="no" />
              <label htmlFor="no">{currentQ.type === 'yesno' ? 'No' : 'False'}</label>
            </div>
          </RadioGroup>
        );
      case 'single':
        return (
          <RadioGroup
            onValueChange={(value) => handleAnswer(currentQ.id, value)}
            value={answers[currentQ.id] as string}
          >
            {currentQ.options.map((option: string) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={option} />
                <label htmlFor={option}>{option}</label>
              </div>
            ))}
          </RadioGroup>
        );
      case 'multiple':
        return (
          <div>
            {currentQ.options.map((option: string) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={option}
                  checked={(answers[currentQ.id] as string[] || []).includes(option)}
                  onCheckedChange={(checked) => {
                    const newValue = checked
                      ? [...(answers[currentQ.id] as string[] || []), option]
                      : (answers[currentQ.id] as string[]).filter((v) => v !== option);
                    handleAnswer(currentQ.id, newValue);
                  }}
                />
                <label htmlFor={option}>{option}</label>
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>{currentQ ? currentQ.text : 'Contact Information'}</CardTitle>
      </CardHeader>
      <CardContent>
        {currentQ ? renderQuestion() : (
          <div className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <div className="flex items-center space-x-2">
              <Checkbox
                id="canContact"
                checked={canContact}
                onCheckedChange={(checked) => setCanContact(checked as boolean)}
              />
              <label htmlFor="canContact">Can we contact you for follow-up?</label>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {currentQuestion > 0 && (
          <Button onClick={() => setCurrentQuestion((prev) => prev - 1)} disabled={isSubmitting}>
            Previous
          </Button>
        )}
        {currentQuestion < questions.length ? (
          <Button onClick={() => setCurrentQuestion((prev) => prev + 1)} disabled={isSubmitting}>
            Next
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}