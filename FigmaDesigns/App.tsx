import React from 'react';
import {
  SplashScreen,
  OnboardingScreen1,
  OnboardingScreen2,
  OnboardingScreen3,
  LoginScreen,
  HomeSenderScreen,
  SendItemStep1,
  SendItemStep2,
  SendItemStep3,
  SendItemStep4,
  SendItemStep5,
} from './components/screens';
import {
  CommuterDashboard,
  AcceptedTaskScreen,
  TrackingScreen,
  ChatScreen,
  ProfileScreen,
} from './components/additional-screens';
import {
  RestrictedItemsScreen,
  BetaDisclaimerScreen,
} from './components/safety-screens';
import { DesignSystemShowcase } from './components/design-showcase';

export default function App() {
  return (
    <div className="min-h-screen bg-[#F3F4F6] py-12">
      <div className="max-w-[1920px] mx-auto px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl text-[#1A1A1A] mb-4">Pikkrr Mobile UI/UX Design</h1>
          <p className="text-xl text-[#6B7280] mb-2">
            Peer-to-peer micro-courier app for MRT commuters
          </p>
          <p className="text-[#6B7280]">
            Community-driven • Voluntary • Safe • Items {'<1kg'}
          </p>
          <div className="mt-6 flex items-center justify-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-[#00C57E] rounded-lg"></div>
              <span className="text-[#6B7280]">Primary: #00C57E</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-[#1A1A1A] rounded-lg"></div>
              <span className="text-[#6B7280]">Dark: #1A1A1A</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-white border-2 border-[#E5E7EB] rounded-lg"></div>
              <span className="text-[#6B7280]">White: #FFFFFF</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-[#EFFFEE] rounded-lg"></div>
              <span className="text-[#6B7280]">Light Mint: #EFFFEE</span>
            </div>
          </div>
        </div>

        {/* Section 1: Splash & Onboarding */}
        <section className="mb-16">
          <div className="mb-6">
            <h2 className="text-3xl text-[#1A1A1A] mb-2">Splash & Onboarding</h2>
            <p className="text-[#6B7280]">First impressions and user introduction</p>
          </div>
          <div className="flex gap-8 overflow-x-auto pb-6">
            <SplashScreen />
            <OnboardingScreen1 />
            <OnboardingScreen2 />
            <OnboardingScreen3 />
          </div>
        </section>

        {/* Section 2: Authentication */}
        <section className="mb-16">
          <div className="mb-6">
            <h2 className="text-3xl text-[#1A1A1A] mb-2">Authentication</h2>
            <p className="text-[#6B7280]">Login and signup flow</p>
          </div>
          <div className="flex gap-8 overflow-x-auto pb-6">
            <LoginScreen />
          </div>
        </section>

        {/* Section 3: Sender Journey */}
        <section className="mb-16">
          <div className="mb-6">
            <h2 className="text-3xl text-[#1A1A1A] mb-2">Sender Journey</h2>
            <p className="text-[#6B7280]">Home screen and send item flow</p>
          </div>
          <div className="flex gap-8 overflow-x-auto pb-6">
            <HomeSenderScreen />
            <SendItemStep1 />
            <SendItemStep2 />
            <SendItemStep3 />
            <SendItemStep4 />
            <SendItemStep5 />
          </div>
        </section>

        {/* Section 4: Commuter Journey */}
        <section className="mb-16">
          <div className="mb-6">
            <h2 className="text-3xl text-[#1A1A1A] mb-2">Commuter Journey</h2>
            <p className="text-[#6B7280]">Available items and task management</p>
          </div>
          <div className="flex gap-8 overflow-x-auto pb-6">
            <CommuterDashboard />
            <AcceptedTaskScreen />
          </div>
        </section>

        {/* Section 5: Tracking & Communication */}
        <section className="mb-16">
          <div className="mb-6">
            <h2 className="text-3xl text-[#1A1A1A] mb-2">Tracking & Communication</h2>
            <p className="text-[#6B7280]">Real-time updates and chat</p>
          </div>
          <div className="flex gap-8 overflow-x-auto pb-6">
            <TrackingScreen />
            <ChatScreen />
          </div>
        </section>

        {/* Section 6: Profile & Settings */}
        <section className="mb-16">
          <div className="mb-6">
            <h2 className="text-3xl text-[#1A1A1A] mb-2">Profile & Settings</h2>
            <p className="text-[#6B7280]">User account management</p>
          </div>
          <div className="flex gap-8 overflow-x-auto pb-6">
            <ProfileScreen />
          </div>
        </section>

        {/* Section 7: Safety & Legal */}
        <section className="mb-16">
          <div className="mb-6">
            <h2 className="text-3xl text-[#1A1A1A] mb-2">Safety & Legal</h2>
            <p className="text-[#6B7280]">Restricted items and beta terms</p>
          </div>
          <div className="flex gap-8 overflow-x-auto pb-6">
            <RestrictedItemsScreen />
            <BetaDisclaimerScreen />
          </div>
        </section>

        {/* Section 8: Design System */}
        <section className="mb-16">
          <div className="mb-6">
            <h2 className="text-3xl text-[#1A1A1A] mb-2">Design System</h2>
            <p className="text-[#6B7280]">Complete component library and style guide</p>
          </div>
          <div className="flex gap-8 overflow-x-auto pb-6">
            <DesignSystemShowcase />
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center py-8 border-t border-[#E5E7EB]">
          <div className="mb-4">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-white rounded-full shadow-lg">
              <div className="w-8 h-8 bg-[#00C57E] rounded-full flex items-center justify-center">
                <span className="text-white">📦</span>
              </div>
              <span className="text-[#1A1A1A]">Pikkrr</span>
              <span className="text-[#6B7280]">•</span>
              <span className="text-[#6B7280]">Your community courier</span>
            </div>
          </div>
          <p className="text-[#6B7280]">
            Complete mobile UI/UX design for peer-to-peer micro-courier app
          </p>
          <p className="text-[#6B7280] text-sm mt-2">390x844 mobile frames • Responsive design • Modern & friendly</p>
        </footer>
      </div>
    </div>
  );
}
